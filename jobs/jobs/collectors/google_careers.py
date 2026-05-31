"""Direct Google careers scrape — intern roles in the USA.

Google retired its JSON API, so we scrape the public search results page:
  https://www.google.com/about/careers/applications/jobs/results/?employment_type=INTERN&location=United+States&q=software+engineer+intern&page=N
"""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timezone
from typing import Iterable
from urllib.parse import urlencode

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


BASE = "https://www.google.com/about/careers/applications/jobs/results/"


# Cards on the search results page
_CARD_RE = re.compile(
    r'<li class="lLd3Je[^"]*"[\s\S]*?'
    r'<h3 class="QJPWVe[^"]*">(?P<title>[^<]+)</h3>'
    r'[\s\S]*?'
    r'(?:<span class="r0wTof[^"]*">[\s\S]*?</span>)?'
    r'[\s\S]*?'
    r'<a[^>]*href="(?P<href>/about/careers/applications/jobs/results/[^"]+)"',
    re.IGNORECASE,
)
# Fallback simpler pattern
_LINK_RE = re.compile(
    r'href="(?P<href>[^"]*jobs/results/(?P<id>\d+)-(?P<slug>[a-z0-9\-]+)[^"]*)"',
    re.IGNORECASE,
)
_TITLE_RE = re.compile(r'<h3[^>]*>([^<]+)</h3>')


class GoogleCareersCollector(Collector):
    name = "google_careers"

    def __init__(self, queries: list[str] | None = None, max_pages: int = 15, **kw) -> None:
        super().__init__(**kw)
        self.queries = queries or [
            "software engineer intern",
            "software engineering intern",
            "machine learning intern",
            "engineering practicum",
            "phd intern",
            "research intern",
            "student researcher",
        ]
        self.max_pages = max_pages

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml",
        }
        out: list[JobPosting] = []
        seen_ids: set[str] = set()
        for q in self.queries:
            for page in range(1, self.max_pages + 1):
                params = {
                    "q": q,
                    "employment_type": "INTERN",
                    "location": "United States",
                    "page": page,
                }
                url = f"{BASE}?{urlencode(params)}"
                try:
                    r = await client.get(url, headers=headers, timeout=self.timeout)
                except Exception as e:
                    logger.debug("google %s p%d failed: %s", q, page, e)
                    break
                if r.status_code != 200:
                    break
                html = r.text
                # iterate <a> -> next sibling <h3> patterns: easier to just zip the lists
                links = list(_LINK_RE.finditer(html))
                titles = _TITLE_RE.findall(html)
                if not links:
                    break
                self.snapshot(f"{q}_p{page}", {"links": len(links), "titles": len(titles)})
                # Pair each link with the nearest title (best-effort)
                for i, m in enumerate(links):
                    job_id = m.group("id")
                    if job_id in seen_ids:
                        continue
                    seen_ids.add(job_id)
                    href = m.group("href")
                    if href.startswith("/"):
                        apply_url = "https://www.google.com" + href
                    elif href.startswith("http"):
                        apply_url = href
                    else:
                        apply_url = "https://www.google.com/about/careers/applications/" + href
                    # Derive title from URL slug; the page's <h3> nodes include sidebar
                    # facet headers that aren't job titles.
                    slug = m.group("slug").replace("-", " ").strip()
                    title = re.sub(r"\b(\d{4})\b", "", slug).strip().title()
                    out.append(JobPosting(
                        source="google_careers",
                        source_id=job_id,
                        company="Google",
                        title=title,
                        locations=["United States"],  # we filter the results page by US already
                        description="",
                        apply_url=apply_url,
                        raw={"query": q, "page": page},
                    ))
                if len(links) < 5:
                    break
                await asyncio.sleep(0.5)  # be polite
        logger.info("google_careers: %d unique intern postings via HTML scrape", len(out))
        return out
