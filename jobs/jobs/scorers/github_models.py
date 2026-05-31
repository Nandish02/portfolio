"""GitHub Models scorer — free, uses gh auth token, OpenAI-compatible endpoint.

Endpoint: POST {base}/chat/completions  ({base} defaults to https://models.github.ai/inference)
Auth:     Authorization: Bearer <gh token>
Model:    e.g. openai/gpt-4o-mini (or Claude when entitlement available)
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import subprocess
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


def _gh_token() -> str:
    tok = os.environ.get("GITHUB_TOKEN") or ""
    if tok:
        return tok
    try:
        out = subprocess.run(
            ["gh", "auth", "token"], check=True, capture_output=True, text=True, timeout=5
        )
        return out.stdout.strip()
    except Exception as e:
        logger.warning("gh auth token unavailable: %s", e)
        return ""


def _extract_json(text: str) -> dict | None:
    if not text:
        return None
    # try direct
    try:
        return json.loads(text)
    except Exception:
        pass
    # extract first balanced {...} block
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except Exception:
        return None


class GitHubModelsScorer:
    backend_name = "github_models"

    def __init__(
        self,
        *,
        base: str | None = None,
        model: str | None = None,
        timeout: float = 60.0,
        concurrency: int = 4,
    ) -> None:
        self.base = (base or os.environ.get("GITHUB_MODELS_BASE") or "https://models.github.ai/inference").rstrip("/")
        self.model_name = model or os.environ.get("GITHUB_MODELS_MODEL") or "openai/gpt-4o-mini"
        self.token = _gh_token()
        self.timeout = timeout
        # tight default concurrency — GitHub Models free tier 429s aggressively
        cc = int(os.environ.get("SCORER_CONCURRENCY", str(concurrency)))
        self._sem = asyncio.Semaphore(cc)
        try:
            self.prompt_template = PROMPT_PATH.read_text()
        except FileNotFoundError:
            logger.error("score prompt not found at %s", PROMPT_PATH)
            self.prompt_template = ""
        self.known_sponsors, self.known_blockers = _load_sponsor_lists()

    async def score(self, resume_md: str, candidate_one_line: str, job: JobPosting) -> JobScore | None:
        if not self.token:
            logger.error("no GitHub token; skipping AI scoring")
            return None
        if not self.prompt_template:
            return None

        co_lower = (job.company or "").lower()
        on_sponsor_list = any(s in co_lower for s in self.known_sponsors)
        on_blocker_list = any(s in co_lower for s in self.known_blockers)
        sponsorship_hint = (
            "KNOWN H-1B SPONSOR (default Sponsorship='Likely Yes' unless JD explicitly says otherwise)"
            if on_sponsor_list else
            "KNOWN BLOCKER (gov / defense / clearance; Sponsorship='No' unless JD says otherwise)"
            if on_blocker_list else
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
            "messages": [
                {"role": "system", "content": "You return STRICT JSON only. No prose, no fences."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 900,
            "response_format": {"type": "json_object"},
        }

        async with self._sem:
            delay = 2.0
            for attempt in range(1, 5):
                try:
                    async with httpx.AsyncClient(timeout=self.timeout) as client:
                        r = await client.post(
                            f"{self.base}/chat/completions",
                            headers={
                                "Authorization": f"Bearer {self.token}",
                                "Content-Type": "application/json",
                            },
                            json=body,
                        )
                    if r.status_code == 429:
                        # honour Retry-After if present
                        ra = r.headers.get("retry-after") or r.headers.get("x-ratelimit-timeremaining")
                        wait = float(ra) if ra and ra.replace(".", "").isdigit() else delay
                        logger.debug("429 for %s/%s; sleeping %.1fs (attempt %d)", job.company, job.title, wait, attempt)
                        await asyncio.sleep(min(wait, 60.0))
                        delay = min(delay * 2, 60.0)
                        continue
                    if r.status_code != 200:
                        logger.debug("scorer HTTP %s: %s", r.status_code, r.text[:200])
                        return None
                    data = r.json()
                    content = (
                        data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    )
                    parsed = _extract_json(content)
                    if not parsed:
                        logger.debug("scorer non-JSON content for %s/%s", job.company, job.title)
                        return None
                    parsed["scorer_backend"] = self.backend_name
                    parsed["scorer_model"] = self.model_name
                    return JobScore.model_validate(parsed)
                except (httpx.TimeoutException, httpx.NetworkError) as e:
                    logger.debug("scorer timeout/net (attempt %d): %s", attempt, e)
                    await asyncio.sleep(delay)
                    delay = min(delay * 2, 60.0)
                except Exception as e:
                    logger.debug("scorer call failed: %s", e)
                    return None
        return None
