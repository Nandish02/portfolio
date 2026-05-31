"""Workday public CXS job search collector.

Endpoint pattern:  POST https://{tenant}.{domain}.myworkdayjobs.com/wday/cxs/{tenant}/{board}/jobs
Body: {"appliedFacets": {}, "limit": 20, "offset": 0, "searchText": "intern"}
Pages up to a safety cap.
"""
from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timedelta, timezone
from html import unescape
from pathlib import Path
from typing import Iterable

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


def _strip_html(s: str) -> str:
    if not s:
        return ""
    import re
    s = re.sub(r"<[^>]+>", " ", s)
    s = unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def _load_companies(path: Path) -> list[dict]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text())
        return data.get("companies") or []
    except Exception as e:
        logger.warning("workday config parse failed: %s", e)
        return []


def _parse_posted_relative(s: str | None) -> datetime | None:
    """Workday returns 'Posted Today', 'Posted Yesterday', 'Posted 5 Days Ago', 'Posted 30+ Days Ago'."""
    if not s:
        return None
    now = datetime.now(timezone.utc)
    sl = s.lower()
    if "today" in sl:
        return now
    if "yesterday" in sl:
        return now - timedelta(days=1)
    import re as _re
    m = _re.search(r"(\d+)\+?\s*days?", sl)
    if m:
        return now - timedelta(days=int(m.group(1)))
    return None


class WorkdayCollector(Collector):
    name = "workday"

    def __init__(self, config_file: Path, search_texts: list[str] | None = None, **kw) -> None:
        super().__init__(**kw)
        self.companies = _load_companies(config_file)
        self.search_texts = search_texts or ["intern", "internship"]

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        tasks = [self._fetch_company(client, c) for c in self.companies]
        out: list[JobPosting] = []
        for batch in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(batch, Exception):
                continue
            out.extend(batch)
        logger.info("workday: %d tenants queried, %d postings", len(self.companies), len(out))
        return out

    async def _fetch_company(self, client: httpx.AsyncClient, cfg: dict) -> list[JobPosting]:
        tenant = cfg.get("tenant")
        domain = cfg.get("domain", "wd1")
        board = cfg.get("board")
        label = cfg.get("label", tenant)
        if not tenant or not board:
            return []
        base = f"https://{tenant}.{domain}.myworkdayjobs.com/wday/cxs/{tenant}/{board}/jobs"
        headers = {"Content-Type": "application/json", "Accept": "application/json"}

        all_jobs: list[dict] = []
        for q in self.search_texts:
            offset = 0
            for _ in range(10):  # max 10 pages * 20 = 200 per query per tenant — plenty for intern roles
                body = {
                    "appliedFacets": {},
                    "limit": 20,
                    "offset": offset,
                    "searchText": q,
                }
                data = await self._get_json(client, base, method="POST", json_body=body, headers=headers)
                if not data or not isinstance(data, dict):
                    break
                postings = data.get("jobPostings") or []
                if not postings:
                    break
                all_jobs.extend(postings)
                total = data.get("total") or 0
                offset += 20
                if offset >= min(total, 200):
                    break

        # de-dupe by externalPath
        seen = set()
        unique = []
        for j in all_jobs:
            k = j.get("externalPath") or j.get("title")
            if k in seen:
                continue
            seen.add(k)
            unique.append(j)
        self.snapshot(tenant, {"label": label, "count": len(unique)})

        out: list[JobPosting] = []
        for j in unique:
            try:
                title = j.get("title") or ""
                if not title:
                    continue
                ext = j.get("externalPath") or ""
                apply_url = f"https://{tenant}.{domain}.myworkdayjobs.com/en-US/{board}{ext}" if ext else ""
                locations = []
                if j.get("locationsText"):
                    locations.append(j["locationsText"])
                if j.get("bulletFields"):
                    locations.extend(b for b in j["bulletFields"] if isinstance(b, str))
                locations = [l for l in dict.fromkeys(locations) if l]

                posted = _parse_posted_relative(j.get("postedOn"))

                out.append(JobPosting(
                    source="workday",
                    source_id=str(j.get("externalPath") or apply_url),
                    company=label,
                    title=title,
                    locations=locations,
                    description="",  # detail fetch is per-job, expensive; we leave empty here
                    apply_url=apply_url,
                    posted_at=posted,
                    raw=j,
                ))
            except Exception as e:
                logger.debug("workday %s normalize fail: %s", label, e)
        return out
