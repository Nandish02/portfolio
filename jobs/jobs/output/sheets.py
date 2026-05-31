"""Google Sheets writer using gspread + service account JSON.

User flow:
  1. Create a Google Cloud project, enable Sheets + Drive APIs.
  2. Create a Service Account, download JSON key. Save path in GOOGLE_SHEETS_SA_JSON.
  3. Either:
     a) Set GOOGLE_SHEETS_ID env var to an existing Sheet ID (and share it with the SA's email
        as Editor), OR
     b) Leave unset — we auto-create a Sheet named 'Internship Hunt 2027' and print the URL
        for the user to open. The SA must have Drive scope to create.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from ..models import ScoredJob


logger = logging.getLogger(__name__)


# Mirror the Excel schema — 29 columns
COLUMNS = [
    "Status", "Priority", "MatchScore", "Sponsorship",
    "Company", "Title", "Location", "Remote",
    "Posted", "Deadline", "Source", "ApplyURL",
    "WorkExperience", "MinGPA", "Degree", "Skills",
    "Comp", "Equity",
    "FitBlurb", "Risks", "TailoredBullet1", "TailoredBullet2", "TailoredBullet3",
    "CoverLetterHook",
    "FirstSeen", "LastSeen", "CanonicalKey",
    "AppliedAt", "ReferralSent",
]


def _format_row(sj: ScoredJob) -> list:
    jp = sj.posting
    score = sj.score
    locs = ", ".join(jp.locations or [])
    is_remote = any("remote" in (l or "").lower() for l in jp.locations or [])
    skills = ", ".join(score.matched_skills) if score else ""
    bullets = (score.tailored_bullets if score else []) + ["", "", ""]
    return [
        "",  # Status
        "",  # Priority
        score.match_score if score else "",
        score.sponsorship if score else "Unknown",
        jp.company or "",
        jp.title or "",
        locs,
        "Yes" if is_remote else "No",
        jp.posted_at.date().isoformat() if jp.posted_at else "",
        jp.deadline.date().isoformat() if getattr(jp, "deadline", None) else "",
        jp.source or "",
        jp.apply_url or "",
        score.experience_years_required if score else "",
        score.min_gpa if score else "",
        ", ".join(score.degree_levels) if score else "",
        skills,
        jp.compensation or "",
        jp.equity or "",
        score.fit_blurb if score else "",
        score.risks if score else "",
        bullets[0], bullets[1], bullets[2],
        score.cover_letter_hook if score else "",
        jp.first_seen.isoformat() if jp.first_seen else "",
        jp.last_seen.isoformat() if jp.last_seen else "",
        jp.canonical_key or "",
        "",  # AppliedAt
        "",  # ReferralSent
    ]


def write_to_sheets(scored: Iterable[ScoredJob]) -> str | None:
    """Push scored jobs to the configured Google Sheet. Returns the Sheet URL."""
    sa_json = os.getenv("GOOGLE_SHEETS_SA_JSON")
    if not sa_json:
        logger.info("GOOGLE_SHEETS_SA_JSON not set — skipping Sheets export")
        return None
    sa_path = Path(sa_json).expanduser()
    if not sa_path.exists():
        logger.warning("Service account JSON not found at %s — skipping Sheets", sa_path)
        return None

    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        logger.warning("gspread not installed — run: pip install gspread google-auth")
        return None

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_file(str(sa_path), scopes=scopes)
    gc = gspread.authorize(creds)

    sheet_id = os.getenv("GOOGLE_SHEETS_ID")
    sheet_title = os.getenv("GOOGLE_SHEETS_TITLE", "Internship Hunt 2027")

    if sheet_id:
        sh = gc.open_by_key(sheet_id)
    else:
        # Auto-create. The Sheet will be owned by the SA — share with user.
        sh = gc.create(sheet_title)
        share_with = os.getenv("GOOGLE_SHEETS_SHARE_WITH")
        if share_with:
            sh.share(share_with, perm_type="user", role="writer", notify=True)
        logger.warning("Created new Sheet: %s — share email is %s", sh.url, creds.service_account_email)

    ws_name = f"Jobs {datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
    # Reuse 'Jobs' tab or create new one
    try:
        ws = sh.worksheet("Jobs")
    except Exception:
        ws = sh.add_worksheet(title="Jobs", rows=2000, cols=len(COLUMNS) + 2)

    rows = [_format_row(sj) for sj in scored]

    # Write header + body in one bulk update
    body = [COLUMNS] + rows
    ws.clear()
    ws.update("A1", body, value_input_option="USER_ENTERED")

    # Freeze header, basic formatting
    sh.batch_update({
        "requests": [
            {"updateSheetProperties": {
                "properties": {
                    "sheetId": ws.id,
                    "gridProperties": {"frozenRowCount": 1, "frozenColumnCount": 4},
                },
                "fields": "gridProperties.frozenRowCount,gridProperties.frozenColumnCount",
            }},
            {"repeatCell": {
                "range": {"sheetId": ws.id, "startRowIndex": 0, "endRowIndex": 1},
                "cell": {"userEnteredFormat": {
                    "backgroundColor": {"red": 0.13, "green": 0.13, "blue": 0.13},
                    "textFormat": {"foregroundColor": {"red": 1, "green": 1, "blue": 1}, "bold": True},
                }},
                "fields": "userEnteredFormat(backgroundColor,textFormat)",
            }},
        ],
    })

    logger.info("Sheets export complete: %d rows -> %s", len(rows), sh.url)
    return sh.url
