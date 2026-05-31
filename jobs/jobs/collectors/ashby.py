"""Ashby public job board API.

Endpoint:  https://api.ashbyhq.com/posting-api/job-board/{org}?includeCompensation=true
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


class AshbyCollector(Collector):
    name = "ashby"

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
        logger.info("ashby: %d slugs queried, %d postings", len(self.slugs), len(out))
        return out

    async def _fetch_one(self, client: httpx.AsyncClient, slug: str) -> list[JobPosting]:
        url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true"
        data = await self._get_json(client, url)
        if not isinstance(data, dict):
            return []
        jobs = data.get("jobs") or []
        if not jobs:
            return []
        self.snapshot(slug, {"count": len(jobs)})
        out: list[JobPosting] = []
        for j in jobs:
            try:
                location = j.get("location") or ""
                sec_locs = j.get("secondaryLocations") or []
                if isinstance(sec_locs, list):
                    sec = []
                    for sl in sec_locs:
                        if isinstance(sl, dict):
                            sec.append(sl.get("location") or "")
                        elif isinstance(sl, str):
                            sec.append(sl)
                    sec_locs = [s for s in sec if s]
                locations = [location] + sec_locs
                if j.get("isRemote"):
                    locations.append("Remote")
                locations = [l for l in dict.fromkeys(locations) if l]

                desc_html = j.get("descriptionHtml") or ""
                desc_plain = j.get("descriptionPlain") or _strip_html(desc_html)

                comp = ""
                cp = j.get("compensation") or {}
                if isinstance(cp, dict) and cp.get("compensationTierSummary"):
                    comp = cp["compensationTierSummary"]

                jp = JobPosting(
                    source="ashby",
                    source_id=str(j.get("id") or j.get("jobUrl", "")),
                    company=slug,
                    title=j.get("title") or "",
                    locations=locations,
                    description=desc_plain[:8000],
                    description_html=desc_html[:30000],
                    apply_url=j.get("applyUrl") or j.get("jobUrl") or "",
                    department=j.get("department") or "",
                    employment_type=j.get("employmentType") or "",
                    salary_text=comp,
                    posted_at=_parse_dt(j.get("publishedAt")),
                    raw=j,
                )
                out.append(jp)
            except Exception as e:
                logger.debug("ashby %s normalize failed: %s", slug, e)
        return out
