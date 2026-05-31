"""Hacker News 'Who is Hiring?' monthly thread collector.

Approach: query Algolia for the latest 'Ask HN: Who is hiring?' story by
author 'whoishiring', then list its comments. Each top-level comment is one job ad.
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from html import unescape
from typing import Iterable

import httpx

from ..models import JobPosting
from .base import Collector


logger = logging.getLogger(__name__)


SEARCH_URL = "https://hn.algolia.com/api/v1/search"
ITEM_URL = "https://hn.algolia.com/api/v1/items/{id}"


_INTERN_RE = re.compile(r"\b(intern|internship|summer\s*20\d{2})\b", re.IGNORECASE)
_USA_RE = re.compile(r"\b(usa|united states|us|new york|nyc|sf|san francisco|bay area|seattle|boston|austin|nyc|los angeles|chicago|remote.{0,10}u\.?s\.?)\b", re.IGNORECASE)
_LOC_LINE_RE = re.compile(r"(?i)(?:location|locations?)\s*:\s*([^\n|]+)")
_COMPANY_HEADER_RE = re.compile(r"^\s*([A-Z][A-Za-z0-9 &\-/]+?)\s*\|", re.MULTILINE)


def _strip_html(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", " ", s)
    s = unescape(s)
    return re.sub(r"\s+", " ", s).strip()


class HNHiringCollector(Collector):
    name = "hn_hiring"

    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        # find the latest "Ask HN: Who is hiring?" thread
        params = {
            "query": "Ask HN: Who is hiring",
            "tags": "story,author_whoishiring",
            "hitsPerPage": 1,
        }
        url = f"{SEARCH_URL}?query={params['query'].replace(' ', '+')}&tags={params['tags']}&hitsPerPage=1"
        res = await self._get_json(client, url)
        if not res or not res.get("hits"):
            logger.warning("hn_hiring: no thread found")
            return []
        story_id = res["hits"][0]["objectID"]
        story = await self._get_json(client, ITEM_URL.format(id=story_id))
        if not story:
            return []
        self.snapshot(f"thread_{story_id}", {"id": story_id, "title": story.get("title")})

        out: list[JobPosting] = []
        for child in story.get("children") or []:
            jp = self._parse_comment(child)
            if jp:
                out.append(jp)
        logger.info("hn_hiring: %d intern-flagged USA postings extracted (raw %d comments)", len(out), len(story.get("children") or []))
        return out

    def _parse_comment(self, c: dict) -> JobPosting | None:
        text = _strip_html(c.get("text") or "")
        if not text:
            return None
        # only intern + (USA OR remote) postings; HN ads are short, dense
        if not _INTERN_RE.search(text):
            return None
        if not _USA_RE.search(text):
            return None

        # Try to extract company from a pipe-delimited header
        # ("Acme Inc. | Backend Engineer | SF, Remote-US | full-time | $150k-200k")
        company = ""
        title = ""
        loc = ""
        parts = [p.strip() for p in text.split("|")]
        if len(parts) >= 2:
            company = parts[0][:80]
            title = parts[1][:120]
            for p in parts[2:5]:
                if _USA_RE.search(p):
                    loc = p[:120]
                    break

        m = _LOC_LINE_RE.search(text)
        if not loc and m:
            loc = m.group(1).strip()[:120]

        if not company:
            return None

        author = c.get("author") or "hn"
        comment_id = c.get("id") or 0
        return JobPosting(
            source="hn_hiring",
            source_id=f"hn:{comment_id}",
            company=company,
            title=title or "(HN ad)",
            locations=[loc] if loc else ["USA"],
            description=text[:4000],
            apply_url=f"https://news.ycombinator.com/item?id={comment_id}",
            posted_at=datetime.fromtimestamp(c.get("created_at_i") or 0, tz=timezone.utc) if c.get("created_at_i") else None,
            raw={"author": author, "id": comment_id},
        )
