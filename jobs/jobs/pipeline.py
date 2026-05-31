"""End-to-end pipeline:

  collectors -> normalize -> dedupe -> filter -> score -> SQLite + xlsx output.

Run with:  python3 -m jobs.pipeline
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx
import yaml

# Auto-load .env from the repo root so callers don't have to `source .env`.
try:
    from dotenv import load_dotenv  # type: ignore
    _ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
    if _ENV_FILE.exists():
        load_dotenv(_ENV_FILE, override=False)
except ImportError:
    pass

from .collectors.ashby import AshbyCollector
from .collectors.github_repos import GitHubReposCollector
from .collectors.google_careers import GoogleCareersCollector
from .collectors.greenhouse import GreenhouseCollector
from .collectors.hn_hiring import HNHiringCollector
from .collectors.lever import LeverCollector
from .collectors.linkedin_guest import LinkedInGuestCollector
from .collectors.rss_feeds import RemoteOKCollector, RemotiveCollector, WeWorkRemotelyCollector
from .collectors.smartrecruiters import SmartRecruitersCollector
from .collectors.workatastartup import WorkAtAStartupCollector
from .collectors.workday import WorkdayCollector
from .dedupe import dedupe
from .filter import filter_postings
from .models import JobPosting, ScoredJob
from .output.excel import export_xlsx
from .output.sheets import write_to_sheets
from .output.sqlite import upsert_postings, upsert_scores, load_scored, recently_scored_keys
from .scorers import get_scorer


ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = ROOT / "config"
DATA_DIR = ROOT / "data"
SNAPSHOTS_DIR = DATA_DIR / "snapshots"
EXPORTS_DIR = DATA_DIR / "exports"
DB_PATH = DATA_DIR / "jobs.db"

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)
logger = logging.getLogger("pipeline")


def _load_prefs() -> dict:
    return yaml.safe_load((CONFIG_DIR / "preferences.yaml").read_text())


def _load_resume_md() -> str:
    return (CONFIG_DIR / "resume.md").read_text()


async def collect(prefs: dict) -> list[JobPosting]:
    enabled = (prefs.get("sources") or {}).get("enabled") or {}
    timeout = float(os.environ.get("HTTP_TIMEOUT_S", "30"))
    concurrency = int(os.environ.get("HTTP_CONCURRENCY", "20"))
    snap = SNAPSHOTS_DIR

    collectors = []
    if enabled.get("github_repos"):
        collectors.append(GitHubReposCollector(timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("greenhouse"):
        collectors.append(GreenhouseCollector(slugs_file=CONFIG_DIR / "companies" / "greenhouse.txt",
                                              timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("lever"):
        collectors.append(LeverCollector(slugs_file=CONFIG_DIR / "companies" / "lever.txt",
                                         timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("ashby"):
        collectors.append(AshbyCollector(slugs_file=CONFIG_DIR / "companies" / "ashby.txt",
                                         timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("hn_hiring"):
        collectors.append(HNHiringCollector(timeout=timeout, concurrency=4, snapshots_dir=snap))
    if enabled.get("workday"):
        collectors.append(WorkdayCollector(
            config_file=CONFIG_DIR / "companies" / "workday.json",
            timeout=timeout, concurrency=concurrency, snapshots_dir=snap,
        ))
    if enabled.get("smartrecruiters"):
        collectors.append(SmartRecruitersCollector(
            slugs_file=CONFIG_DIR / "companies" / "smartrecruiters.txt",
            timeout=timeout, concurrency=concurrency, snapshots_dir=snap,
        ))
    if enabled.get("workatastartup"):
        collectors.append(WorkAtAStartupCollector(timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("linkedin_guest"):
        collectors.append(LinkedInGuestCollector(timeout=timeout, concurrency=1, snapshots_dir=snap))
    if enabled.get("google_careers"):
        collectors.append(GoogleCareersCollector(timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("remoteok"):
        collectors.append(RemoteOKCollector(timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("remotive"):
        collectors.append(RemotiveCollector(timeout=timeout, concurrency=concurrency, snapshots_dir=snap))
    if enabled.get("weworkremotely"):
        collectors.append(WeWorkRemotelyCollector(timeout=timeout, concurrency=concurrency, snapshots_dir=snap))

    headers = {"User-Agent": "nandish-internship-pipeline/0.1 (educational, polite)"}
    all_postings: list[JobPosting] = []
    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        results = await asyncio.gather(
            *(c.fetch(client) for c in collectors), return_exceptions=True
        )
    for c, r in zip(collectors, results):
        if isinstance(r, Exception):
            logger.error("collector %s failed: %s", c.name, r)
            continue
        all_postings.extend(r)
    return all_postings


async def score_postings(postings: list[JobPosting], prefs: dict) -> list[tuple[str, "ScoredJob"]]:
    """Score the top-N postings (by recency + intern flag). Returns list of (key, JobScore) tuples."""
    scorer = get_scorer()
    if scorer is None:
        logger.warning("scorer disabled; skipping AI scoring step")
        return []

    top_n = int(os.environ.get("SCORE_TOP_N", "300"))
    rescore_days = int(os.environ.get("RESCORE_AFTER_DAYS", "14"))
    skip_keys = recently_scored_keys(DB_PATH, rescore_days)
    if skip_keys:
        before = len(postings)
        postings = [p for p in postings if p.canonical_key not in skip_keys]
        logger.info("incremental: skipping %d jobs already scored < %dd ago", before - len(postings), rescore_days)
    candidates = [p for p in postings if p.is_intern]
    # Prioritise SWE-relevant intern titles: software, swe, backend, infra, distributed,
    # platform, systems, ml infra, mlops. Tiebreak by recency.
    swe_words = (
        "software", "swe", "sde", "backend", "back end", "infra", "platform",
        "systems", "distributed", "cloud", "mlops", "ml infra", "ml engineering",
        "developer", "full stack", "fullstack", "engineering",
    )
    def _rank(p):
        t = (p.title or "").lower()
        swe_hit = 1 if any(w in t for w in swe_words) else 0
        ts = (p.posted_at or p.first_seen).timestamp()
        return (-swe_hit, -ts)
    candidates.sort(key=_rank)
    candidates = candidates[:top_n]

    resume_md = _load_resume_md()
    candidate_one_line = (prefs.get("candidate") or {}).get("one_line", "")

    logger.info("scoring %d postings via %s/%s", len(candidates), scorer.backend_name, scorer.model_name)
    results: list[tuple[str, "ScoredJob"]] = []
    # process in chunks to be polite
    chunk_size = 8
    for i in range(0, len(candidates), chunk_size):
        chunk = candidates[i:i + chunk_size]
        scores = await asyncio.gather(
            *(scorer.score(resume_md, candidate_one_line, jp) for jp in chunk),
            return_exceptions=True,
        )
        for jp, sc in zip(chunk, scores):
            if isinstance(sc, Exception) or sc is None:
                continue
            results.append((jp.canonical_key, sc))
        if (i + chunk_size) % 40 == 0:
            logger.info("scored %d/%d", min(i + chunk_size, len(candidates)), len(candidates))
    logger.info("scored %d/%d successfully", len(results), len(candidates))
    return results


async def run() -> int:
    started = datetime.now(timezone.utc)
    prefs = _load_prefs()

    logger.info("=== STEP 1: collect ===")
    raw = await collect(prefs)
    logger.info("collected %d raw postings", len(raw))

    logger.info("=== STEP 2: dedupe ===")
    deduped = dedupe(raw)
    logger.info("after dedupe: %d unique", len(deduped))

    logger.info("=== STEP 3: filter ===")
    filtered = filter_postings(deduped, prefs)
    logger.info("after filter: %d candidates", len(filtered))

    logger.info("=== STEP 4: persist postings ===")
    stats = upsert_postings(DB_PATH, filtered)
    logger.info("sqlite: inserted=%d updated=%d", stats["inserted"], stats["updated"])

    logger.info("=== STEP 5: AI score top-N ===")
    scored = await score_postings(filtered, prefs)
    if scored:
        n = upsert_scores(DB_PATH, scored)
        logger.info("sqlite: scored rows persisted=%d", n)

    logger.info("=== STEP 6: export xlsx ===")
    all_scored = load_scored(DB_PATH)
    today = started.strftime("%Y-%m-%d-%H%M%S")
    out = export_xlsx(all_scored, EXPORTS_DIR / f"jobs_{today}.xlsx")
    logger.info("done. xlsx -> %s", out)

    logger.info("=== STEP 7: export Google Sheets (if configured) ===")
    try:
        sheet_url = write_to_sheets(all_scored)
        if sheet_url:
            logger.info("Sheet URL: %s", sheet_url)
    except Exception as e:
        logger.warning("Sheets export failed: %s", e)

    elapsed = (datetime.now(timezone.utc) - started).total_seconds()
    logger.info("=== PIPELINE COMPLETE in %.1fs ===", elapsed)
    return 0


async def run_ats_only() -> int:
    """Lightweight hourly mode: collect from ATS sources only, dedupe, persist.
    No AI scoring, no exports. Designed for hourly launchd runs.
    """
    started = datetime.now(timezone.utc)
    prefs = _load_prefs()
    # force-enable only ATS sources
    en = prefs.setdefault("sources", {}).setdefault("enabled", {})
    for k in ("github_repos", "linkedin_guest", "hn_hiring", "workatastartup"):
        en[k] = False
    for k in ("greenhouse", "lever", "ashby", "workday", "smartrecruiters", "google_careers"):
        en.setdefault(k, True)

    raw = await collect(prefs)
    deduped = dedupe(raw)
    filtered = filter_postings(deduped, prefs)
    stats = upsert_postings(DB_PATH, filtered)
    logger.info("ATS hourly run: %d raw -> %d deduped -> %d filtered (inserted=%d updated=%d) in %.1fs",
                len(raw), len(deduped), len(filtered), stats["inserted"], stats["updated"],
                (datetime.now(timezone.utc) - started).total_seconds())
    return 0


async def run_google_window() -> int:
    """Oct/Nov high-frequency Google careers poller. Just Google, no scoring."""
    started = datetime.now(timezone.utc)
    prefs = _load_prefs()
    en = prefs.setdefault("sources", {}).setdefault("enabled", {})
    for k in list(en.keys()):
        en[k] = False
    en["google_careers"] = True
    raw = await collect(prefs)
    deduped = dedupe(raw)
    filtered = filter_postings(deduped, prefs)
    stats = upsert_postings(DB_PATH, filtered)
    # detect brand new Google postings since last run
    inserted = stats["inserted"]
    logger.info("Google window run: %d raw, %d filtered, %d NEW in %.1fs",
                len(raw), len(filtered), inserted,
                (datetime.now(timezone.utc) - started).total_seconds())
    # optional Discord webhook ping for new rows
    if inserted > 0:
        webhook = os.environ.get("DISCORD_WEBHOOK_URL")
        if webhook:
            try:
                async with httpx.AsyncClient() as c:
                    await c.post(webhook, json={
                        "content": f":rotating_light: **{inserted} new Google intern postings** detected!",
                    }, timeout=10)
            except Exception as e:
                logger.warning("discord ping failed: %s", e)
    return 0


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "ats":
        sys.exit(asyncio.run(run_ats_only()))
    elif mode == "google":
        sys.exit(asyncio.run(run_google_window()))
    else:
        sys.exit(asyncio.run(run()))


if __name__ == "__main__":
    main()
