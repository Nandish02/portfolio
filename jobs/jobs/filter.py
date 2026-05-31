"""Filter postings by location (USA), freshness, title keywords, and visa-sponsorship signals."""
from __future__ import annotations

import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Iterable

from .models import JobPosting


logger = logging.getLogger(__name__)


# Heuristic state code regex (matches " NY ", "NY,", "NY)" etc.)
_US_STATE = re.compile(
    r"\b("
    r"AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|"
    r"NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC"
    r")\b"
)

# US country/region aliases (word-bounded). Bare "remote" alone is NOT enough — it must
# co-occur with US/USA/state code in the SAME location string (handled separately).
_US_COUNTRY = re.compile(r"(?i)\b(usa|u\.s\.a\.|united\s+states|us|u\.s)\b")

# Remote in the same string as a US qualifier — e.g. "Remote - US", "USA Remote", "Remote in the United States".
_US_REMOTE = re.compile(
    r"(?i)remote.{0,30}\b(usa?|u\.?s\.?|united\s+states)\b"
    r"|\b(usa?|u\.?s\.?|united\s+states)\b.{0,30}remote"
)


def _matches_any(text: str, needles: list[str]) -> str | None:
    if not text:
        return None
    t = text.lower()
    for n in needles:
        nl = n.lower().strip()
        if not nl:
            continue
        if nl in t:
            return n
    return None


def location_ok(jp: JobPosting, prefs: dict) -> bool:
    loc_cfg = (prefs.get("locations") or {})
    allowed = [a.lower() for a in loc_cfg.get("allowed_keywords", [])]
    blocked = [b.lower() for b in loc_cfg.get("blocked_keywords", [])]
    if not jp.locations:
        # accept only if description clearly says US/Remote
        desc = (jp.description or "").lower()
        return bool(_US_COUNTRY.search(desc))

    any_usa_match = False
    for raw_loc in jp.locations:
        loc = (raw_loc or "").lower()
        # blocked wins for that specific location entry
        if any(b in loc for b in blocked):
            continue
        # Explicit US country / state / remote-with-US-qualifier
        if _US_COUNTRY.search(loc) or _US_STATE.search(raw_loc or "") or _US_REMOTE.search(loc):
            any_usa_match = True
            break
        # allowed substring (city names, etc.) — but require it to also not be in a non-US country
        if any(a in loc for a in allowed):
            any_usa_match = True
            break
    return any_usa_match


def freshness_ok(jp: JobPosting, prefs: dict) -> bool:
    days = (prefs.get("freshness") or {}).get("days", 21)
    if not jp.posted_at:
        # absence of a date — assume fresh-ish
        return True
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    posted = jp.posted_at
    if posted.tzinfo is None:
        posted = posted.replace(tzinfo=timezone.utc)
    return posted >= cutoff


_INTERN_TITLE_RE = re.compile(
    r"(?i)\b(intern|internship|interns|co[-\s]?op|coop|"
    r"summer\s+20\d{2}|practicum|apprentice)\b"
)


def title_ok(jp: JobPosting, prefs: dict) -> bool:
    """Strict title check — the role must be CLEARLY an intern role by title alone.

    No substring fallback to description (avoids matching 'international').
    """
    title_cfg = prefs.get("titles") or {}
    must_not = [m.lower().strip() for m in title_cfg.get("must_not_match_any", []) if m.strip()]
    title_low = (jp.title or "").lower()

    if must_not and any(b and b in title_low for b in must_not):
        return False

    return bool(_INTERN_TITLE_RE.search(jp.title or ""))


def season_ok(jp: JobPosting, prefs: dict) -> bool:
    """Reject postings explicitly tied to a past or wrong season.

    Logic:
      - If JD text matches any reject_explicit phrase AND none of accept_explicit  -> drop.
      - Else accept (ambiguous postings without a year are kept).
    """
    season_cfg = prefs.get("season") or {}
    accept = [s.lower() for s in season_cfg.get("accept_explicit", [])]
    reject = [s.lower() for s in season_cfg.get("reject_explicit", [])]
    if not reject:
        return True
    text = ((jp.title or "") + " " + (jp.description or "")[:2000]).lower()
    # Also check raw fields from Simplify/Vansh which include a 'season' field
    raw_season = ""
    raw_terms = ""
    raw = jp.raw or {}
    if isinstance(raw, dict):
        raw_season = (raw.get("season") or "").lower()
        terms = raw.get("terms") or []
        if isinstance(terms, list):
            raw_terms = " ".join(t.lower() for t in terms if isinstance(t, str))
    blob = f"{text} {raw_season} {raw_terms}"
    has_accept = any(a in blob for a in accept)
    has_reject = any(r in blob for r in reject)
    if has_reject and not has_accept:
        return False
    return True


# Tech-relevance pre-filter — drops obvious non-CS intern roles (HR/marketing/law/etc.)
# before AI scoring. Keeps the pipeline cheap and the spreadsheet focused.
_TECH_RELEVANT_RE = re.compile(
    r"(?i)\b("
    r"software|swe|sde|developer|engineer|engineering|backend|back\s*end|front\s*end|"
    r"fullstack|full\s*stack|web|mobile|ios|android|systems?|platform|infra(structure)?|"
    r"cloud|devops|sre|site\s*reliability|distributed|database|data\s*(engineer|scien|ml|"
    r"engineering|platform)|machine\s*learning|ml|ai\s|artificial\s*intelligence|deep\s*learning|"
    r"computer\s*science|cs\b|robotics|firmware|embedded|security|cyber|cryptograph|"
    r"network|compiler|graphics|vision|nlp|llm|search|ranking|recommender|quant|"
    r"trading|hft|fpga|asic|hardware|chip\s*design|silicon|gpu|cuda|kernel"
    r")\b"
)
# Adjacent (but valid) intern programs that don't always carry "engineer" in title
_TECH_ADJACENT_RE = re.compile(
    r"(?i)\b("
    r"research\s*intern|student\s*researcher|technical\s*intern|technology\s*intern|"
    r"product\s*intern|technical\s*program\s*manager|tpm\s*intern|engineering\s*practicum|"
    r"applied\s*science|data\s*analyst\s*intern"
    r")\b"
)


def tech_relevant(jp: JobPosting) -> bool:
    """True if the title strongly suggests a CS/SWE/data/infra intern role."""
    title = jp.title or ""
    if _TECH_RELEVANT_RE.search(title):
        return True
    if _TECH_ADJACENT_RE.search(title):
        return True
    return False


def is_summer_2027(jp: JobPosting, prefs: dict) -> bool:
    """Boolean — for ranking. True if posting clearly targets Summer 2027."""
    accept = [s.lower() for s in (prefs.get("season") or {}).get("accept_explicit", [])]
    text = ((jp.title or "") + " " + (jp.description or "")[:2000]).lower()
    raw = jp.raw if isinstance(jp.raw, dict) else {}
    season = (raw.get("season") or "").lower()
    terms = " ".join((raw.get("terms") or []) if isinstance(raw.get("terms"), list) else []).lower()
    return any(a in text or a in season or a in terms for a in accept)


def sponsorship_ok(jp: JobPosting, prefs: dict) -> bool:
    sp = prefs.get("sponsorship") or {}
    mode = (sp.get("filter_mode") or "strict").lower()
    if mode == "off":
        return True
    phrases = [p.lower() for p in sp.get("no_sponsorship_phrases", [])]
    text = (jp.description or "").lower()
    hit = _matches_any(text, phrases)
    if hit:
        if mode == "strict":
            return False
        # lenient: still surface but flagged elsewhere
    return True


def filter_postings(postings: Iterable[JobPosting], prefs: dict) -> list[JobPosting]:
    out: list[JobPosting] = []
    stats = {
        "total": 0, "title_drop": 0, "location_drop": 0,
        "freshness_drop": 0, "sponsorship_drop": 0, "season_drop": 0,
        "non_tech_drop": 0, "kept": 0, "summer_2027": 0,
    }
    require_tech = bool((prefs.get("titles") or {}).get("require_tech_relevant", True))
    for jp in postings:
        stats["total"] += 1
        if not title_ok(jp, prefs):
            stats["title_drop"] += 1
            continue
        if require_tech and not tech_relevant(jp):
            stats["non_tech_drop"] += 1
            continue
        if not season_ok(jp, prefs):
            stats["season_drop"] += 1
            continue
        if not freshness_ok(jp, prefs):
            stats["freshness_drop"] += 1
            continue
        if not location_ok(jp, prefs):
            stats["location_drop"] += 1
            continue
        if not sponsorship_ok(jp, prefs):
            stats["sponsorship_drop"] += 1
            continue
        out.append(jp)
        stats["kept"] += 1
        if is_summer_2027(jp, prefs):
            stats["summer_2027"] += 1
    logger.info("filter stats: %s", stats)
    return out
