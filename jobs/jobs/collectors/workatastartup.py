"""YC Work at a Startup public listings.

Strategy: hit the public search endpoint with filters for intern role + US.
GraphQL/JSON is private; we use the public companies.json + job-card scrape.
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Iterable

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


SEARCH_URLS = [
    # filtering: role=intern, US-located, role=swe
    "https://www.workatastartup.com/jobs?type=intern&role=swe",
    "https://www.workatastartup.com/jobs?type=intern",
]


_JOB_HREF_RE = re.compile(r'href="/jobs/(\d+)[^"]*"[^>]*>(?P<title>[^<]+)<', re.IGNORECASE | re.DOTALL)
_CARD_RE = re.compile(
    r'<a[^>]*href="/companies/(?P<co_slug>[^"]+)/jobs/(?P<job_id>\d+)[^"]*"[^>]*>'
    r'(?P<inner>[\s\S]{0,2000}?)</a>',
    re.IGNORECASE,
)


class WorkAtAStartupCollector(Collector):
    name = "workatastartup"

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        # WAAS gates its full listings behind login. We hit the public companies index
        # which exposes a JSON list of public-board jobs.
        url = "https://www.workatastartup.com/companies.json"
        headers = {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        }
        data = await self._get_json(client, url, headers=headers)
        if not data:
            # Fallback: try the search endpoint
            data = await self._get_json(
                client,
                "https://www.workatastartup.com/jobs.json",
                headers=headers,
            )
        if not isinstance(data, list):
            # Some endpoints wrap in an object
            if isinstance(data, dict) and "companies" in data:
                data = data["companies"]
            else:
                logger.info("workatastartup: companies.json empty/unavailable")
                return []
        self.snapshot("companies_index", {"count": len(data)})

        out: list[JobPosting] = []
        for c in data:
            try:
                jobs = (c.get("jobs") or [])
                co_name = c.get("name") or c.get("slug") or ""
                for j in jobs:
                    title = j.get("title") or ""
                    tl = title.lower()
                    if not any(w in tl for w in ("intern", "internship", "co-op", "coop")):
                        continue
                    locs = []
                    loc = j.get("location") or ""
                    if loc:
                        locs.append(loc)
                    remote = j.get("remote")
                    if isinstance(remote, str) and remote:
                        locs.append(f"Remote ({remote})")
                    elif remote is True:
                        locs.append("Remote")
                    apply_url = (
                        j.get("url")
                        or f"https://www.workatastartup.com/jobs/{j.get('id')}"
                    )
                    out.append(JobPosting(
                        source="workatastartup",
                        source_id=str(j.get("id") or apply_url),
                        company=co_name,
                        title=title,
                        locations=locs,
                        description=(j.get("description") or "")[:8000],
                        apply_url=apply_url,
                        raw=j,
                    ))
            except Exception as e:
                logger.debug("workatastartup normalize fail: %s", e)
        logger.info("workatastartup: %d intern postings", len(out))
        return out
