"""Dedupe across sources by canonical_key. Keeps first_seen, updates last_seen + sources list."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable

from .models import JobPosting


def dedupe(postings: Iterable[JobPosting]) -> list[JobPosting]:
    by_key: dict[str, JobPosting] = {}
    sources_by_key: dict[str, list[str]] = {}
    for jp in postings:
        if not jp.company or not jp.title:
            continue
        key = jp.canonical_key
        if key in by_key:
            existing = by_key[key]
            # keep earliest first_seen, latest last_seen
            if jp.first_seen and (not existing.first_seen or jp.first_seen < existing.first_seen):
                existing.first_seen = jp.first_seen
            existing.last_seen = max(
                existing.last_seen or datetime.now(timezone.utc),
                jp.last_seen or datetime.now(timezone.utc),
            )
            # prefer the one with richer description / apply url
            if len(jp.description or "") > len(existing.description or ""):
                existing.description = jp.description
                existing.description_html = jp.description_html
            if not existing.apply_url and jp.apply_url:
                existing.apply_url = jp.apply_url
            if jp.source not in sources_by_key[key]:
                sources_by_key[key].append(jp.source)
        else:
            by_key[key] = jp.model_copy()
            sources_by_key[key] = [jp.source]

    # stamp combined source string back on
    for key, jp in by_key.items():
        jp.source = ",".join(sources_by_key[key])
    return list(by_key.values())
