"""Collector base class — async HTTP with retry, snapshotting, polite throttling."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import httpx

from ..models import JobPosting


logger = logging.getLogger(__name__)


def _today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


class Collector(ABC):
    """Abstract collector. Subclasses implement fetch() returning JobPosting iterables."""

    name: str = "unknown"

    def __init__(
        self,
        *,
        timeout: float = 30.0,
        concurrency: int = 10,
        snapshots_dir: Path | None = None,
    ) -> None:
        self.timeout = timeout
        self.concurrency = concurrency
        self.snapshots_dir = snapshots_dir
        self._sem = asyncio.Semaphore(concurrency)

    @abstractmethod
    async def fetch(self, client: httpx.AsyncClient) -> Iterable[JobPosting]:
        """Yield JobPosting instances."""
        raise NotImplementedError

    async def _get_json(
        self,
        client: httpx.AsyncClient,
        url: str,
        *,
        method: str = "GET",
        json_body: Any = None,
        headers: dict[str, str] | None = None,
        params: dict[str, Any] | None = None,
        max_retries: int = 3,
    ) -> Any:
        """GET (or POST) with retry/backoff. Returns parsed JSON or None on permanent failure."""
        async with self._sem:
            delay = 1.0
            for attempt in range(1, max_retries + 1):
                try:
                    if method == "POST":
                        r = await client.post(url, json=json_body, headers=headers or {}, params=params, timeout=self.timeout)
                    else:
                        r = await client.get(url, headers=headers or {}, params=params, timeout=self.timeout)
                    if r.status_code == 404:
                        return None
                    if r.status_code in (429, 502, 503, 504):
                        logger.debug("%s %s -> %s, retry %d", method, url, r.status_code, attempt)
                        await asyncio.sleep(delay)
                        delay *= 2
                        continue
                    if r.status_code >= 400:
                        logger.debug("%s %s -> %s (giving up)", method, url, r.status_code)
                        return None
                    try:
                        return r.json()
                    except Exception:
                        logger.debug("Non-JSON response from %s", url)
                        return None
                except (httpx.TimeoutException, httpx.NetworkError) as e:
                    logger.debug("%s %s timeout/net: %s, retry %d", method, url, e, attempt)
                    await asyncio.sleep(delay)
                    delay *= 2
                except Exception as e:
                    logger.warning("%s %s unexpected: %s", method, url, e)
                    return None
            return None

    def snapshot(self, name: str, payload: Any) -> None:
        if not self.snapshots_dir:
            return
        try:
            day = self.snapshots_dir / _today_str() / self.name
            day.mkdir(parents=True, exist_ok=True)
            (day / f"{name}.json").write_text(json.dumps(payload, default=str, indent=2)[:5_000_000])
        except Exception as e:
            logger.debug("snapshot failed for %s: %s", name, e)
