"""Lever public postings API.

Endpoint: https://api.lever.co/v0/postings/{slug}?mode=json
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


class LeverCollector(Collector):
    name = "lever"

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
        logger.info("lever: %d slugs queried, %d postings", len(self.slugs), len(all_postings))
        return all_postings

    async def _fetch_one(self, client: httpx.AsyncClient, slug: str) -> list[JobPosting]:
        url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
        data = await self._get_json(client, url)
        if not isinstance(data, list):
            return []
        self.snapshot(slug, {"count": len(data)})
        out: list[JobPosting] = []
        for j in data:
            try:
                cats = j.get("categories") or {}
                location = cats.get("location") or ""
                team = cats.get("team") or ""
                commitment = cats.get("commitment") or ""
                workplace_type = cats.get("workplaceType") or ""
                additional_locations = cats.get("additionalLocations") or []

                locations = [location] if location else []
                locations += [l for l in additional_locations if l]
                if workplace_type:
                    locations.append(workplace_type)
                locations = [l for l in dict.fromkeys(locations) if l]

                desc_html = (j.get("descriptionPlain") or j.get("description") or "")
                desc = _strip_html(desc_html) if "<" in desc_html else desc_html
                if j.get("lists"):
                    for sec in j["lists"]:
                        sec_title = sec.get("text", "")
                        sec_content = _strip_html(sec.get("content") or "")
                        desc += f"\n\n{sec_title}\n{sec_content}"

                created_ts = j.get("createdAt")
                posted_at = None
                if isinstance(created_ts, (int, float)):
                    try:
                        posted_at = datetime.fromtimestamp(created_ts / 1000, tz=timezone.utc)
                    except Exception:
                        pass

                jp = JobPosting(
                    source="lever",
                    source_id=str(j.get("id") or j.get("hostedUrl", "")),
                    company=slug,
                    title=j.get("text") or "",
                    locations=locations,
                    description=desc[:8000],
                    apply_url=j.get("hostedUrl") or j.get("applyUrl") or "",
                    department=team,
                    employment_type=commitment,
                    posted_at=posted_at,
                    raw=j,
                )
                out.append(jp)
            except Exception as e:
                logger.debug("lever %s normalize failed: %s", slug, e)
        return out
