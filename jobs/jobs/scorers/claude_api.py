"""Anthropic Claude direct-API scorer.

Endpoint: POST https://api.anthropic.com/v1/messages
Auth:     x-api-key: <ANTHROPIC_API_KEY>
Docs:     https://docs.anthropic.com/en/api/messages

Reads:
  ANTHROPIC_API_KEY              required
  ANTHROPIC_MODEL                optional, default claude-sonnet-4-5
  ANTHROPIC_BASE                 optional, default https://api.anthropic.com
  SCORER_CONCURRENCY             optional, default 3
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from pathlib import Path

import httpx
import yaml

from ..models import JobPosting, JobScore


logger = logging.getLogger(__name__)


PROMPT_PATH = Path(__file__).resolve().parents[2] / "config" / "prompts" / "score_prompt.md"
PREFS_PATH = Path(__file__).resolve().parents[2] / "config" / "preferences.yaml"


def _load_sponsor_lists() -> tuple[list[str], list[str]]:
    try:
        prefs = yaml.safe_load(PREFS_PATH.read_text())
        sp = prefs.get("sponsorship") or {}
        return (
            [s.lower() for s in sp.get("known_sponsors", [])],
            [s.lower() for s in sp.get("known_blockers", [])],
        )
    except Exception:
        return [], []


def _extract_json(text: str) -> dict | None:
    if not text:
        return None
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except Exception:
        return None


class ClaudeAPIScorer:
    backend_name = "claude_api"

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str | None = None,
        base: str | None = None,
        timeout: float = 60.0,
        concurrency: int = 3,
    ) -> None:
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY") or ""
        self.model_name = model or os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-5"
        self.base = (base or os.environ.get("ANTHROPIC_BASE") or "https://api.anthropic.com").rstrip("/")
        self.timeout = timeout
        cc = int(os.environ.get("SCORER_CONCURRENCY", str(concurrency)))
        self._sem = asyncio.Semaphore(cc)
        try:
            self.prompt_template = PROMPT_PATH.read_text()
        except FileNotFoundError:
            logger.error("score prompt not found at %s", PROMPT_PATH)
            self.prompt_template = ""
        self.known_sponsors, self.known_blockers = _load_sponsor_lists()

    async def score(self, resume_md: str, candidate_one_line: str, job: JobPosting) -> JobScore | None:
        if not self.api_key:
            logger.error("ANTHROPIC_API_KEY not set; skipping Claude scoring")
            return None
        if not self.prompt_template:
            return None

        co_lower = (job.company or "").lower()
        on_sponsor = any(s in co_lower for s in self.known_sponsors)
        on_blocker = any(s in co_lower for s in self.known_blockers)
        sponsorship_hint = (
            "KNOWN H-1B SPONSOR (default Sponsorship='Likely Yes' unless JD explicitly says otherwise)"
            if on_sponsor else
            "KNOWN BLOCKER (gov / defense / clearance; Sponsorship='No' unless JD says otherwise)"
            if on_blocker else
            "NOT ON ANY LIST (use JD text + general SWE-hiring knowledge)"
        )

        prompt = self.prompt_template.format(
            resume_md=resume_md[:8000],
            candidate_one_line=candidate_one_line,
            company=job.company,
            title=job.title,
            locations=", ".join(job.locations) or "n/a",
            description=(job.description or "")[:4000],
        )
        prompt += f"\n\nCompany sponsorship status: {sponsorship_hint}\n"

        body = {
            "model": self.model_name,
            "max_tokens": 1024,
            "system": "You return STRICT JSON only. No prose, no markdown fences.",
            "messages": [
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }

        async with self._sem:
            delay = 2.0
            for attempt in range(1, 5):
                try:
                    async with httpx.AsyncClient(timeout=self.timeout) as client:
                        r = await client.post(
                            f"{self.base}/v1/messages",
                            headers=headers,
                            json=body,
                        )
                    if r.status_code == 429 or r.status_code == 529:
                        ra = r.headers.get("retry-after")
                        wait = float(ra) if ra and ra.replace(".", "").isdigit() else delay
                        logger.debug(
                            "Claude %s for %s/%s; sleeping %.1fs (attempt %d)",
                            r.status_code, job.company, job.title, wait, attempt,
                        )
                        await asyncio.sleep(min(wait, 60.0))
                        delay = min(delay * 2, 60.0)
                        continue
                    if r.status_code == 401:
                        logger.error("ANTHROPIC_API_KEY rejected (401). Check the key value.")
                        return None
                    if r.status_code != 200:
                        logger.debug("Claude HTTP %s: %s", r.status_code, r.text[:300])
                        return None
                    data = r.json()
                    # response shape: {"content": [{"type":"text","text":"..."}], ...}
                    content_blocks = data.get("content") or []
                    text = ""
                    for blk in content_blocks:
                        if isinstance(blk, dict) and blk.get("type") == "text":
                            text += blk.get("text", "")
                    parsed = _extract_json(text)
                    if not parsed:
                        logger.debug("Claude non-JSON content for %s/%s", job.company, job.title)
                        return None
                    parsed["scorer_backend"] = self.backend_name
                    parsed["scorer_model"] = self.model_name
                    return JobScore.model_validate(parsed)
                except (httpx.TimeoutException, httpx.NetworkError) as e:
                    logger.debug("Claude timeout/net (attempt %d): %s", attempt, e)
                    await asyncio.sleep(delay)
                    delay = min(delay * 2, 60.0)
                except Exception as e:
                    logger.debug("Claude call failed: %s", e)
                    return None
        return None
