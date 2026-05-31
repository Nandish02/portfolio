"""Scorer protocol — all backends conform to this."""
from __future__ import annotations

from typing import Protocol

from ..models import JobPosting, JobScore


class Scorer(Protocol):
    backend_name: str
    model_name: str

    async def score(self, resume_md: str, candidate_one_line: str, job: JobPosting) -> JobScore | None: ...
