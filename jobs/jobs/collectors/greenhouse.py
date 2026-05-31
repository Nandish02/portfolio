"""Greenhouse public boards API collector.

Endpoint:  https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
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
    out = []
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        out.append(line)
    return out


def _strip_html(s: str) -> str:
    if not s:
        return ""
    import re
    s = re.sub(r"<[^>]+>", " ", s)
    s = unescape(s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _parse_dt(s) -> datetime | None:
    if not s:
        return None
    try:
        # Greenhouse uses ISO 8601 with offset
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


class GreenhouseCollector(Collector):
    name = "greenhouse"

    def __init__(self, slugs_file: Path, **kw) -> None:
        super().__init__(**kw)
        self.slugs = _read_slugs(slugs_file)

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        tasks = [self._fetch_one(client, slug) for slug in self.slugs]
        all_postings: list[JobPosting] = []
        for batch in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(batch, Exception):
                continue
            all_postings.extend(batch)
        logger.info("greenhouse: %d slugs queried, %d postings", len(self.slugs), len(all_postings))
        return all_postings

    async def _fetch_one(self, client: httpx.AsyncClient, slug: str) -> list[JobPosting]:
        url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true"
        data = await self._get_json(client, url)
        if not data or not isinstance(data, dict):
            return []
        jobs = data.get("jobs") or []
        if not jobs:
            return []
        self.snapshot(slug, {"meta": data.get("meta"), "count": len(jobs)})
        out: list[JobPosting] = []
        for j in jobs:
            try:
                locations = []
                if j.get("location") and j["location"].get("name"):
                    locations = [j["location"]["name"]]
                if j.get("offices"):
                    locations.extend(o.get("name", "") for o in j["offices"] if o.get("name"))
                locations = [l for l in dict.fromkeys(locations) if l]

                title = j.get("title") or ""
                apply_url = j.get("absolute_url") or ""
                desc_html = j.get("content") or ""
                description = _strip_html(desc_html)

                jp = JobPosting(
                    source="greenhouse",
                    source_id=str(j.get("id") or apply_url),
                    company=slug,
                    title=title,
                    locations=locations,
                    description=description[:8000],
                    description_html=desc_html[:30000],
                    apply_url=apply_url,
                    department=", ".join(d.get("name", "") for d in (j.get("departments") or []) if d.get("name")),
                    posted_at=_parse_dt(j.get("updated_at")),
                    raw=j,
                )
                out.append(jp)
            except Exception as e:
                logger.debug("greenhouse %s normalize failed: %s", slug, e)
        return out
