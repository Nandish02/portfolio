"""LinkedIn guest API — public job cards via the seeMoreJobPostings/search endpoint.

NO authentication, just queries the public RSS-style HTML. We throttle 1 req/3s
to stay polite and avoid CAPTCHAs. ToS allows public viewing; we never auto-click apply.
"""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Iterable

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


BASE = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"

# Default queries — tune for your stack. Each pulls ~25 cards/page.
DEFAULT_QUERIES = [
    "software engineer intern",
    "software developer intern",
    "machine learning intern",
    "backend engineer intern",
    "data engineer intern",
    "site reliability intern",
    "ml engineer intern",
    "platform engineer intern",
    "full stack intern",
]


_CARD_RE = re.compile(
    r'<div class="base-card[^"]*"[^>]*data-entity-urn="urn:li:jobPosting:(?P<job_id>\d+)"'
    r'[\s\S]*?<a class="base-card__full-link"[^>]*href="(?P<url>[^"]+)"'
    r'[\s\S]*?<h3[^>]*>\s*(?P<title>[^<]+?)\s*</h3>'
    r'[\s\S]*?<h4[^>]*>\s*<a[^>]*>\s*(?P<company>[^<]+?)\s*</a>'
    r'[\s\S]*?<span class="job-search-card__location">\s*(?P<location>[^<]+?)\s*</span>'
    r'[\s\S]*?(?:<time[^>]*datetime="(?P<dt>[^"]+)"[^>]*>(?P<dt_text>[^<]+)</time>)?',
    re.IGNORECASE | re.DOTALL,
)


class LinkedInGuestCollector(Collector):
    name = "linkedin_guest"

    def __init__(self, queries: list[str] | None = None, location: str = "United States", pages_per_query: int = 4, **kw) -> None:
        super().__init__(**kw)
        self.queries = queries or DEFAULT_QUERIES
        self.location = location
        self.pages_per_query = pages_per_query

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        out: list[JobPosting] = []
        for q in self.queries:
            for page in range(self.pages_per_query):
                params = {
                    "keywords": q,
                    "location": self.location,
                    "f_TPR": "r604800",  # last 7 days
                    "f_E": "1",            # internship level
                    "start": page * 25,
                }
                headers = {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "text/html",
                }
                try:
                    r = await client.get(BASE, params=params, headers=headers, timeout=30)
                except Exception as e:
                    logger.debug("linkedin q=%r page=%d failed: %s", q, page, e)
                    await asyncio.sleep(3)
                    continue
                if r.status_code != 200:
                    logger.debug("linkedin q=%r page=%d status=%d", q, page, r.status_code)
                    await asyncio.sleep(3)
                    continue
                html = r.text
                cards = list(_CARD_RE.finditer(html))
                if not cards:
                    await asyncio.sleep(3)
                    break
                self.snapshot(f"{q}_p{page}", {"cards": len(cards)})
                for m in cards:
                    try:
                        d = m.groupdict()
                        url = d.get("url") or ""
                        url = url.split("?")[0]
                        dt_str = d.get("dt")
                        posted = None
                        if dt_str:
                            try:
                                posted = datetime.fromisoformat(dt_str).replace(tzinfo=timezone.utc)
                            except Exception:
                                pass
                        out.append(JobPosting(
                            source="linkedin_guest",
                            source_id=d.get("job_id") or url,
                            company=(d.get("company") or "").strip(),
                            title=(d.get("title") or "").strip(),
                            locations=[(d.get("location") or "").strip()],
                            description="",
                            apply_url=url,
                            posted_at=posted,
                            raw={"query": q, "page": page},
                        ))
                    except Exception as e:
                        logger.debug("linkedin parse fail: %s", e)
                await asyncio.sleep(3)  # be polite
        # de-dupe by source_id
        seen = set()
        unique = []
        for jp in out:
            if jp.source_id in seen:
                continue
            seen.add(jp.source_id)
            unique.append(jp)
        logger.info("linkedin_guest: %d unique cards across %d queries", len(unique), len(self.queries))
        return unique
