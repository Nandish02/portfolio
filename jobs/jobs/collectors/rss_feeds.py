"""RSS / JSON feed collectors for remote-friendly job boards.

Sources:
  - RemoteOK              https://remoteok.com/api  (returns JSON list)
  - WeWorkRemotely        https://weworkremotely.com/categories/remote-programming-jobs.rss
  - Authentic Jobs        https://authenticjobs.com/rss/custom.php?... (skipped — paid)
  - Remotive              https://remotive.com/api/remote-jobs?category=software-dev
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from typing import Iterable

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


def _strip_html(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", " ", s)
    s = unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def _parse_dt(s) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    except Exception:
        pass
    try:
        return parsedate_to_datetime(s)
    except Exception:
        return None


class RemoteOKCollector(Collector):
    name = "remoteok"

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        url = "https://remoteok.com/api"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/124.0 Safari/537.36",
            "Accept": "application/json",
        }
        data = await self._get_json(client, url, headers=headers)
        if not isinstance(data, list):
            logger.info("remoteok: feed empty/unavailable")
            return []
        # First element is metadata
        rows = [r for r in data if isinstance(r, dict) and r.get("id")]
        self.snapshot("api", {"count": len(rows)})
        out: list[JobPosting] = []
        for j in rows:
            title = (j.get("position") or "").strip()
            if not title:
                continue
            tl = title.lower()
            if not any(w in tl for w in ("intern", "internship", "co-op", "coop")):
                continue
            company = (j.get("company") or "").strip()
            tags = j.get("tags") or []
            location = j.get("location") or "Remote"
            locs = [location] if isinstance(location, str) else list(location or [])
            out.append(JobPosting(
                source="remoteok",
                source_id=str(j.get("id")),
                company=company,
                title=title,
                locations=locs or ["Remote"],
                description=_strip_html(j.get("description") or "")[:8000],
                apply_url=j.get("url") or j.get("apply_url") or "",
                posted_at=_parse_dt(j.get("date") or j.get("epoch")),
                raw={"tags": tags, **{k: v for k, v in j.items() if k != "description"}},
            ))
        logger.info("remoteok: %d intern postings", len(out))
        return out


class RemotiveCollector(Collector):
    name = "remotive"

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        url = "https://remotive.com/api/remote-jobs?category=software-dev"
        data = await self._get_json(client, url)
        if not isinstance(data, dict):
            return []
        rows = data.get("jobs") or []
        self.snapshot("api", {"count": len(rows)})
        out: list[JobPosting] = []
        for j in rows:
            title = (j.get("title") or "").strip()
            if not title:
                continue
            tl = title.lower()
            if not any(w in tl for w in ("intern", "internship", "co-op", "coop")):
                continue
            out.append(JobPosting(
                source="remotive",
                source_id=str(j.get("id")),
                company=(j.get("company_name") or "").strip(),
                title=title,
                locations=[j.get("candidate_required_location") or "Remote"],
                description=_strip_html(j.get("description") or "")[:8000],
                apply_url=j.get("url") or "",
                posted_at=_parse_dt(j.get("publication_date")),
                raw=j,
            ))
        logger.info("remotive: %d intern postings", len(out))
        return out


_WWR_ITEM = re.compile(
    r"<item>[\s\S]*?<title>(?P<title>[\s\S]*?)</title>"
    r"[\s\S]*?<link>(?P<link>[^<]+)</link>"
    r"[\s\S]*?<pubDate>(?P<pubdate>[^<]+)</pubDate>"
    r"[\s\S]*?<description>(?P<desc>[\s\S]*?)</description>",
    re.IGNORECASE,
)


class WeWorkRemotelyCollector(Collector):
    name = "weworkremotely"

    FEEDS = [
        "https://weworkremotely.com/categories/remote-programming-jobs.rss",
        "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
        "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
        "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
    ]

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        out: list[JobPosting] = []
        seen: set[str] = set()
        for feed in self.FEEDS:
            try:
                r = await client.get(feed, timeout=self.timeout, headers={
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/rss+xml,text/xml",
                })
            except Exception as e:
                logger.debug("wwr feed %s failed: %s", feed, e)
                continue
            if r.status_code != 200:
                continue
            for m in _WWR_ITEM.finditer(r.text):
                d = m.groupdict()
                title_raw = unescape(d["title"]).strip()
                # WWR titles are "Company Name: Role"
                parts = title_raw.split(":", 1)
                company = parts[0].strip() if len(parts) == 2 else ""
                title = (parts[1] if len(parts) == 2 else title_raw).strip()
                if not any(w in title.lower() for w in ("intern", "internship", "co-op", "coop")):
                    continue
                link = d["link"].strip()
                if link in seen:
                    continue
                seen.add(link)
                out.append(JobPosting(
                    source="weworkremotely",
                    source_id=link,
                    company=company or "Unknown",
                    title=title,
                    locations=["Remote"],
                    description=_strip_html(d["desc"])[:8000],
                    apply_url=link,
                    posted_at=_parse_dt(d["pubdate"]),
                    raw={"feed": feed},
                ))
        logger.info("weworkremotely: %d intern postings", len(out))
        return out
