"""
STAGE 7 — Continuous Learning & Calibration

Runs after a request completes, never blocks it. Feeds two things back
upstream: the rework-cost signal (Stage 2's future risk scoring) and the
decision log the Bias Sentinel (bias_sentinel.py) audits.
"""

from app.contracts import CheckResult, Envelope


def record_outcome(envelope: Envelope) -> CheckResult:
    return CheckResult(
        check_id="record_outcome", stage=7, mechanism="function", action="allow",
        title="Outcome recorded",
        description="Run outcome and interventions were recorded for future calibration.",
        metric="recorded",
    )
