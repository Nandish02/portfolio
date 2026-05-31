"""SQLite persistence — UPSERT by canonical_key, append source list, persist scores."""
from __future__ import annotations

import json
import logging
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from ..models import JobPosting, JobScore, ScoredJob


logger = logging.getLogger(__name__)


SCHEMA = """
CREATE TABLE IF NOT EXISTS postings (
    canonical_key TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    source_id TEXT,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    locations TEXT,
    description TEXT,
    apply_url TEXT,
    department TEXT,
    employment_type TEXT,
    salary_text TEXT,
    posted_at TEXT,
    deadline_at TEXT,
    first_seen TEXT,
    last_seen TEXT,
    raw TEXT,
    status TEXT DEFAULT 'New',
    date_applied TEXT,
    notes TEXT,
    referral_available INTEGER DEFAULT 0,
    follow_up_date TEXT
);

CREATE TABLE IF NOT EXISTS scores (
    canonical_key TEXT PRIMARY KEY,
    score INTEGER,
    sponsorship TEXT,
    yoe_required TEXT,
    required_skills TEXT,
    nice_to_have TEXT,
    your_skill_match TEXT,
    your_skill_gap TEXT,
    fit_blurb TEXT,
    tailored_bullets TEXT,
    cover_letter_hook TEXT,
    scored_at TEXT,
    scorer_backend TEXT,
    scorer_model TEXT,
    FOREIGN KEY (canonical_key) REFERENCES postings(canonical_key)
);

CREATE INDEX IF NOT EXISTS idx_postings_company ON postings(company);
CREATE INDEX IF NOT EXISTS idx_postings_posted_at ON postings(posted_at);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score);
"""


def _connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def upsert_postings(db_path: Path, postings: list[JobPosting]) -> dict:
    conn = _connect(db_path)
    inserted = updated = 0
    try:
        for jp in postings:
            key = jp.canonical_key
            existing = conn.execute(
                "SELECT canonical_key, first_seen FROM postings WHERE canonical_key = ?", (key,)
            ).fetchone()
            if existing:
                conn.execute(
                    """
                    UPDATE postings SET
                        source = ?, source_id = ?, company = ?, title = ?, locations = ?,
                        description = ?, apply_url = ?, department = ?, employment_type = ?,
                        salary_text = ?, posted_at = ?, deadline_at = ?, last_seen = ?, raw = ?
                    WHERE canonical_key = ?
                    """,
                    (
                        jp.source, jp.source_id, jp.company, jp.title,
                        json.dumps(jp.locations),
                        jp.description, jp.apply_url, jp.department, jp.employment_type,
                        jp.salary_text,
                        jp.posted_at.isoformat() if jp.posted_at else None,
                        jp.deadline_at.isoformat() if jp.deadline_at else None,
                        datetime.now(timezone.utc).isoformat(),
                        json.dumps(jp.raw, default=str)[:500_000],
                        key,
                    ),
                )
                updated += 1
            else:
                conn.execute(
                    """
                    INSERT INTO postings(
                        canonical_key, source, source_id, company, title, locations,
                        description, apply_url, department, employment_type, salary_text,
                        posted_at, deadline_at, first_seen, last_seen, raw
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                    """,
                    (
                        key, jp.source, jp.source_id, jp.company, jp.title,
                        json.dumps(jp.locations),
                        jp.description, jp.apply_url, jp.department, jp.employment_type,
                        jp.salary_text,
                        jp.posted_at.isoformat() if jp.posted_at else None,
                        jp.deadline_at.isoformat() if jp.deadline_at else None,
                        jp.first_seen.isoformat(),
                        jp.last_seen.isoformat(),
                        json.dumps(jp.raw, default=str)[:500_000],
                    ),
                )
                inserted += 1
    finally:
        conn.close()
    return {"inserted": inserted, "updated": updated}


def upsert_scores(db_path: Path, items: list[tuple[str, JobScore]]) -> int:
    conn = _connect(db_path)
    n = 0
    try:
        for key, sc in items:
            conn.execute(
                """
                INSERT INTO scores(
                    canonical_key, score, sponsorship, yoe_required,
                    required_skills, nice_to_have, your_skill_match, your_skill_gap,
                    fit_blurb, tailored_bullets, cover_letter_hook,
                    scored_at, scorer_backend, scorer_model
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(canonical_key) DO UPDATE SET
                    score = excluded.score,
                    sponsorship = excluded.sponsorship,
                    yoe_required = excluded.yoe_required,
                    required_skills = excluded.required_skills,
                    nice_to_have = excluded.nice_to_have,
                    your_skill_match = excluded.your_skill_match,
                    your_skill_gap = excluded.your_skill_gap,
                    fit_blurb = excluded.fit_blurb,
                    tailored_bullets = excluded.tailored_bullets,
                    cover_letter_hook = excluded.cover_letter_hook,
                    scored_at = excluded.scored_at,
                    scorer_backend = excluded.scorer_backend,
                    scorer_model = excluded.scorer_model
                """,
                (
                    key, sc.score, sc.sponsorship, sc.yoe_required,
                    json.dumps(sc.required_skills),
                    json.dumps(sc.nice_to_have),
                    json.dumps(sc.your_skill_match),
                    json.dumps(sc.your_skill_gap),
                    sc.fit_blurb,
                    json.dumps(sc.tailored_bullets),
                    sc.cover_letter_hook,
                    sc.scored_at.isoformat(),
                    sc.scorer_backend,
                    sc.scorer_model,
                ),
            )
            n += 1
    finally:
        conn.close()
    return n


def recently_scored_keys(db_path: Path, days: int = 14) -> set[str]:
    """Return canonical_keys whose score is fresh enough to skip re-scoring."""
    if days <= 0:
        return set()
    conn = _connect(db_path)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    try:
        rows = conn.execute(
            "SELECT canonical_key FROM scores WHERE scored_at >= ?", (cutoff,)
        ).fetchall()
    finally:
        conn.close()
    return {r["canonical_key"] for r in rows}


def load_scored(db_path: Path) -> list[ScoredJob]:
    conn = _connect(db_path)
    try:
        rows = conn.execute(
            """
            SELECT p.*, s.score, s.sponsorship, s.yoe_required, s.required_skills,
                   s.nice_to_have, s.your_skill_match, s.your_skill_gap, s.fit_blurb,
                   s.tailored_bullets, s.cover_letter_hook, s.scored_at,
                   s.scorer_backend, s.scorer_model
            FROM postings p LEFT JOIN scores s ON p.canonical_key = s.canonical_key
            """
        ).fetchall()
    finally:
        conn.close()

    out: list[ScoredJob] = []
    for r in rows:
        try:
            jp = JobPosting(
                source=r["source"],
                source_id=r["source_id"] or "",
                company=r["company"],
                title=r["title"],
                locations=json.loads(r["locations"]) if r["locations"] else [],
                description=r["description"] or "",
                apply_url=r["apply_url"] or "",
                department=r["department"] or "",
                employment_type=r["employment_type"] or "",
                salary_text=r["salary_text"] or "",
                posted_at=datetime.fromisoformat(r["posted_at"]) if r["posted_at"] else None,
                deadline_at=datetime.fromisoformat(r["deadline_at"]) if r["deadline_at"] else None,
                first_seen=datetime.fromisoformat(r["first_seen"]),
                last_seen=datetime.fromisoformat(r["last_seen"]),
            )
            sc = None
            if r["score"] is not None:
                sc = JobScore(
                    score=r["score"],
                    sponsorship=r["sponsorship"] or "Unknown",
                    yoe_required=r["yoe_required"] or "n/a",
                    required_skills=json.loads(r["required_skills"] or "[]"),
                    nice_to_have=json.loads(r["nice_to_have"] or "[]"),
                    your_skill_match=json.loads(r["your_skill_match"] or "[]"),
                    your_skill_gap=json.loads(r["your_skill_gap"] or "[]"),
                    fit_blurb=r["fit_blurb"] or "",
                    tailored_bullets=json.loads(r["tailored_bullets"] or "[]"),
                    cover_letter_hook=r["cover_letter_hook"] or "",
                    scored_at=datetime.fromisoformat(r["scored_at"]) if r["scored_at"] else datetime.now(timezone.utc),
                    scorer_backend=r["scorer_backend"] or "",
                    scorer_model=r["scorer_model"] or "",
                )
            out.append(ScoredJob(posting=jp, score=sc))
        except Exception as e:
            logger.debug("load_scored row error: %s", e)
    return out
