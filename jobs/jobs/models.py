"""Core data schemas — every collector emits JobPosting; the scorer emits JobScore."""
from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


SponsorshipStatus = Literal["Yes", "Likely Yes", "No", "Unknown"]


_COMPANY_NORMALIZE_RE = re.compile(
    r"\b(inc|llc|ltd|gmbh|pbc|corp|corporation|incorporated|co|company|limited)\b\.?",
    re.IGNORECASE,
)
_NONALNUM_RE = re.compile(r"[^a-z0-9]+")


def canonical_company(name: str) -> str:
    if not name:
        return ""
    n = name.lower().strip()
    n = _COMPANY_NORMALIZE_RE.sub("", n)
    n = _NONALNUM_RE.sub(" ", n).strip()
    return " ".join(n.split())


def canonical_title(title: str) -> str:
    if not title:
        return ""
    t = title.lower().strip()
    # collapse seniority numerals, common synonyms
    t = re.sub(r"\b(i{1,3}|iv|v)\b", "", t)
    t = re.sub(r"\b(intern|internship|interns)\b", "intern", t)
    t = _NONALNUM_RE.sub(" ", t).strip()
    return " ".join(t.split())


def canonical_location(loc: str) -> str:
    if not loc:
        return ""
    l = loc.lower().strip()
    l = re.sub(r"\s+", " ", l)
    return l


def url_host(url: str) -> str:
    if not url:
        return ""
    m = re.match(r"https?://([^/]+)", url)
    return m.group(1).lower() if m else ""


class JobPosting(BaseModel):
    """Unified job posting model — every collector emits this."""

    model_config = ConfigDict(extra="ignore")

    # identity
    source: str = Field(..., description="collector name, e.g. 'greenhouse'")
    source_id: str = Field(..., description="source-specific job id")
    company: str
    title: str
    locations: list[str] = Field(default_factory=list)

    # detail
    description: str = ""
    description_html: str = ""
    apply_url: str = ""
    department: str = ""
    employment_type: str = ""        # Full-time / Intern / Contract
    salary_text: str = ""

    # timing
    posted_at: datetime | None = None
    deadline_at: datetime | None = None

    # bookkeeping
    first_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw: dict[str, Any] = Field(default_factory=dict)

    @property
    def canonical_key(self) -> str:
        """Stable hash across sources. Used for UPSERT."""
        loc = canonical_location(self.locations[0]) if self.locations else ""
        parts = [
            canonical_company(self.company),
            canonical_title(self.title),
            loc,
            url_host(self.apply_url),
        ]
        joined = "|".join(parts)
        return hashlib.sha256(joined.encode("utf-8")).hexdigest()[:24]

    @property
    def primary_location(self) -> str:
        return self.locations[0] if self.locations else ""

    @property
    def is_intern(self) -> bool:
        t = (self.title or "").lower()
        et = (self.employment_type or "").lower()
        return (
            "intern" in t
            or "co-op" in t
            or "coop" in t
            or "intern" in et
        )


class JobScore(BaseModel):
    """AI scorer output — one per JobPosting."""

    model_config = ConfigDict(extra="ignore")

    score: int = Field(ge=1, le=10)
    sponsorship: SponsorshipStatus = "Unknown"
    yoe_required: str = "n/a"
    required_skills: list[str] = Field(default_factory=list)
    nice_to_have: list[str] = Field(default_factory=list)
    your_skill_match: list[str] = Field(default_factory=list)
    your_skill_gap: list[str] = Field(default_factory=list)
    fit_blurb: str = ""
    tailored_bullets: list[str] = Field(default_factory=list)
    cover_letter_hook: str = ""
    scored_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    scorer_backend: str = ""
    scorer_model: str = ""


class ScoredJob(BaseModel):
    """Convenience join of JobPosting + JobScore for output rendering."""

    posting: JobPosting
    score: JobScore | None = None
