"""SimplifyJobs + vanshb03 internship list collectors.

Both repos publish a flat JSON list under .github/scripts/listings.json (Simplify)
or .github/scripts/listings.json (Vansh) — different schema, same idea.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Iterable

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


SIMPLIFY_URL = "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json"
VANSH_URL = "https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/dev/.github/scripts/listings.json"


def _epoch_to_dt(v) -> datetime | None:
    if not v:
        return None
    try:
        return datetime.fromtimestamp(int(v), tz=timezone.utc)
    except Exception:
        return None


class GitHubReposCollector(Collector):
    name = "github_repos"

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        out: list[JobPosting] = []
        for tag, url in (("simplify", SIMPLIFY_URL), ("vansh", VANSH_URL)):
            data = await self._get_json(client, url)
            if not isinstance(data, list):
                logger.warning("%s returned no list (got %s)", url, type(data).__name__)
                continue
            self.snapshot(tag, data)
            for row in data:
                jp = self._normalize(tag, row)
                if jp:
                    out.append(jp)
        logger.info("github_repos: %d postings", len(out))
        return out

    def _normalize(self, tag: str, row: dict) -> JobPosting | None:
        try:
            if not row.get("active", True):
                return None
            if not row.get("is_visible", True):
                return None
            title = row.get("title") or ""
            company = row.get("company_name") or row.get("company") or ""
            if not title or not company:
                return None

            locations = row.get("locations") or []
            if isinstance(locations, str):
                locations = [locations]

            apply_url = row.get("url") or row.get("company_url") or ""
            posted = _epoch_to_dt(row.get("date_posted"))
            updated = _epoch_to_dt(row.get("date_updated"))
            sponsorship = (row.get("sponsorship") or "").strip()
            season = (row.get("season") or "").strip()
            terms = row.get("terms") or []

            description_parts = []
            if sponsorship:
                description_parts.append(f"Sponsorship: {sponsorship}")
            if season:
                description_parts.append(f"Season: {season}")
            if terms:
                description_parts.append(f"Terms: {', '.join(terms)}")
            description = " | ".join(description_parts)

            return JobPosting(
                source=f"github_repos:{tag}",
                source_id=str(row.get("id") or f"{tag}:{company}:{title}:{','.join(locations)}"),
                company=company,
                title=title,
                locations=locations,
                description=description,
                apply_url=apply_url,
                posted_at=posted,
                last_seen=updated or datetime.now(timezone.utc),
                raw=row,
            )
        except Exception as e:
            logger.debug("simplify normalize failed: %s", e)
            return None
