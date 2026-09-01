"""
Genuine continuous learning: reads real persisted check-decision history
from SQLite (not synthetic data) and computes each check's actual
action-rate distribution. This is what Stage 7 feeds back into — as more
real runs accumulate, these numbers shift, and Stage 2/5's heuristic
thresholds can be tuned against them over time.
"""

from collections import Counter

from app.db import database


async def compute_check_stats() -> dict:
    events = await database.get_all_events(limit=2000)
    by_check: dict[str, Counter] = {}
    for e in events:
        cid = e["check_id"] or "unlabeled"
        by_check.setdefault(cid, Counter())[e["action"] or "allow"] += 1

    stats = {}
    for cid, counter in by_check.items():
        total = sum(counter.values())
        stats[cid] = {
            "total_decisions": total,
            "allow_rate": round(counter.get("allow", 0) / total, 3),
            "fix_rate": round(counter.get("fix", 0) / total, 3),
            "escalate_rate": round(counter.get("escalate", 0) / total, 3),
            "block_rate": round(counter.get("block", 0) / total, 3),
        }
    return {
        "checks": stats,
        "total_events_on_file": len(events),
        "note": "Computed from real persisted event history (SQLite), not synthetic data. "
                "Grows and shifts as more runs complete.",
    }
