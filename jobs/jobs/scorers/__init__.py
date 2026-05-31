"""Pluggable scorer backends.

Selected by JOB_SCORER env var, or auto-detected from available API keys.

Priority when JOB_SCORER=auto (default):
  1. ANTHROPIC_API_KEY        -> claude_api      (best quality)
  2. OPENAI_API_KEY           -> openai_api      (also excellent)
  3. GEMINI_API_KEY           -> gemini_api      (cheapest, big free tier)
  4. BEDROCK creds            -> bedrock         (AWS $200 credit)
  5. GITHUB_TOKEN / gh CLI    -> github_models   (free tier)
  6. else                     -> none            (no AI)
"""
from __future__ import annotations

import logging
import os
import shutil

from .base import Scorer


logger = logging.getLogger(__name__)


def _has_gh_token() -> bool:
    if os.environ.get("GITHUB_TOKEN"):
        return True
    return shutil.which("gh") is not None


def _has_bedrock() -> bool:
    return bool(os.environ.get("AWS_ACCESS_KEY_ID")) and bool(
        os.environ.get("AWS_SECRET_ACCESS_KEY")
    )


def _auto_pick() -> str:
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "claude_api"
    if os.environ.get("OPENAI_API_KEY"):
        return "openai_api"
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        return "gemini_api"
    if _has_bedrock():
        return "bedrock"
    if _has_gh_token():
        return "github_models"
    return "none"


def get_scorer() -> Scorer | None:
    raw = (os.environ.get("JOB_SCORER") or "auto").lower().strip()
    if raw == "auto":
        name = _auto_pick()
        logger.info("JOB_SCORER=auto -> picked %s", name)
    else:
        name = raw

    if name == "none":
        return None

    if name == "claude_api":
        try:
            from .claude_api import ClaudeAPIScorer
            return ClaudeAPIScorer()
        except ImportError as e:
            logger.warning("claude_api unavailable: %s", e)
            return None

    if name == "openai_api":
        try:
            from .openai_api import OpenAIScorer
            return OpenAIScorer()
        except ImportError as e:
            logger.warning("openai_api unavailable: %s", e)
            return None

    if name == "gemini_api":
        try:
            from .gemini_api import GeminiScorer
            return GeminiScorer()
        except ImportError as e:
            logger.warning("gemini_api unavailable: %s", e)
            return None

    if name == "github_models":
        from .github_models import GitHubModelsScorer
        return GitHubModelsScorer()

    if name == "bedrock":
        try:
            from .bedrock import BedrockScorer
            return BedrockScorer()
        except ImportError:
            logger.warning("bedrock scorer not implemented yet; falling back to none")
            return None

    if name == "fcc":
        try:
            from .fcc import FCCScorer
            return FCCScorer()
        except ImportError:
            logger.warning("fcc scorer not implemented yet; falling back to none")
            return None

    logger.warning("unknown scorer %r; falling back to none", name)
    return None
