"""
Study Results API
Handles volunteer registration and study data submission.
Results are saved to /root/PetitonLetterUserstudyFrontend/Result/
"""
import json
import logging
from pathlib import Path
from datetime import datetime

import portalocker
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/study", tags=["study"])

RESULT_DIR = Path("/root/PetitonLetterUserstudyFrontend/Result")
COUNTER_FILE = RESULT_DIR / ".counter.json"


def _read_counter() -> int:
    """Read current counter value, starting from 0 if file doesn't exist."""
    if not COUNTER_FILE.exists():
        return 0
    with open(COUNTER_FILE, "r") as f:
        return json.load(f).get("count", 0)


def _write_counter(count: int) -> None:
    RESULT_DIR.mkdir(parents=True, exist_ok=True)
    with open(COUNTER_FILE, "w") as f:
        json.dump({"count": count}, f)


@router.post("/register")
def register_volunteer():
    """Register a new volunteer and return a sequential ID like P001."""
    RESULT_DIR.mkdir(parents=True, exist_ok=True)

    # File-based atomic counter
    lock_path = RESULT_DIR / ".counter.lock"
    with portalocker.Lock(str(lock_path), timeout=5):
        count = _read_counter() + 1
        _write_counter(count)

    participant_id = f"P{count:03d}"
    logger.info(f"Registered volunteer: {participant_id}")
    return {"participantId": participant_id}


class StudySubmission(BaseModel):
    participantId: str
    data: dict


@router.post("/submit")
def submit_results(submission: StudySubmission):
    """Save study results to a JSON file in the Result directory."""
    RESULT_DIR.mkdir(parents=True, exist_ok=True)

    filename = f"{submission.participantId}.json"
    filepath = RESULT_DIR / filename

    payload = {
        "participantId": submission.participantId,
        "submittedAt": datetime.utcnow().isoformat(),
        **submission.data,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    logger.info(f"Saved results for {submission.participantId} to {filepath}")
    return {"success": True, "file": filename}
