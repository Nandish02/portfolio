"""SmartRecruiters public postings API.

Endpoint: https://api.smartrecruiters.com/v1/companies/{slug}/postings?limit=100&offset=0
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from html import unescape
from pathlib import Path
from typing import Iterable

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


def _read_slugs(path: Path) -> list[str]:
    if not path.exists():
        return []
    return [
        line.strip()
        for line in path.read_text().splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]


def _strip_html(s: str) -> str:
    if not s:
        return ""
    import re
    s = re.sub(r"<[^>]+>", " ", s)
    s = unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def _parse_dt(s) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


class SmartRecruitersCollector(Collector):
    name = "smartrecruiters"

    def __init__(self, slugs_file: Path, **kw) -> None:
        super().__init__(**kw)
        self.slugs = _read_slugs(slugs_file)

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        tasks = [self._fetch_one(client, slug) for slug in self.slugs]
        out: list[JobPosting] = []
        for batch in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(batch, Exception):
                continue
            out.extend(batch)
        logger.info("smartrecruiters: %d slugs queried, %d postings", len(self.slugs), len(out))
        return out

    async def _fetch_one(self, client: httpx.AsyncClient, slug: str) -> list[JobPosting]:
        url = f"https://api.smartrecruiters.com/v1/companies/{slug}/postings?limit=100&offset=0"
        data = await self._get_json(client, url)
        if not data or not isinstance(data, dict):
            return []
        postings = data.get("content") or []
        if not postings:
            return []
        self.snapshot(slug, {"total": data.get("totalFound"), "count": len(postings)})
        out: list[JobPosting] = []
        for j in postings:
            try:
                locs = []
                loc = j.get("location") or {}
                if isinstance(loc, dict):
                    parts = [loc.get("city"), loc.get("region"), loc.get("country")]
                    locs.append(", ".join(p for p in parts if p))
                if j.get("workplaceType"):
                    locs.append(j["workplaceType"].get("label", "") if isinstance(j["workplaceType"], dict) else str(j["workplaceType"]))
                locs = [l for l in dict.fromkeys(locs) if l]

                jp = JobPosting(
                    source="smartrecruiters",
                    source_id=str(j.get("id") or j.get("uuid", "")),
                    company=(j.get("company") or {}).get("name") if isinstance(j.get("company"), dict) else slug,
                    title=j.get("name") or "",
                    locations=locs,
                    description=_strip_html((j.get("jobAd") or {}).get("sections", {}).get("jobDescription", {}).get("text", "") if isinstance(j.get("jobAd"), dict) else "")[:8000],
                    apply_url=j.get("ref") or j.get("postingUrl") or "",
                    posted_at=_parse_dt(j.get("releasedDate")),
                    raw=j,
                )
                if jp.company:
                    out.append(jp)
            except Exception as e:
                logger.debug("smartrecruiters %s normalize fail: %s", slug, e)
        return out
