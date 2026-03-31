"""
ProofMatch AI — Tool 5: Verdict Report Generator
Synthesizes all tool outputs into a final verdict with reasoning.
"""

import logging

logger = logging.getLogger("proofmatch.tools.reporter")


async def generate_verdict_report(
    extracted_fields: dict,
    integrity_result: dict,
    duplicate_result: dict,
    metadata_result: dict,
) -> dict:
    """
    Generate final verdict report by combining all tool outputs.

    Args:
        extracted_fields: Output from extract_upi_fields
        integrity_result: Output from verify_transaction_integrity
        duplicate_result: Output from check_duplicate
        metadata_result: Output from analyze_image_metadata

    Returns:
        Dictionary with verdict, confidence_score, reasoning_summary, red_flags, recommended_action
    """
    logger.info("Generating final verdict report")

    red_flags = []
    confidence = integrity_result.get("confidence_score", 50.0)
    issues = integrity_result.get("integrity_issues", [])

    # ── Collect red flags from integrity issues ──
    for issue in issues:
        severity = issue.get("severity", "medium")
        desc = issue.get("description", "Unknown issue")
        if severity in ("high", "critical"):
            red_flags.append(f"🔴 {desc}")
        elif severity == "medium":
            red_flags.append(f"🟡 {desc}")

    # ── Check extraction errors ──
    if extracted_fields.get("_extraction_error"):
        red_flags.append(f"🔴 Field extraction error: {extracted_fields['_extraction_error']}")
        confidence = min(confidence, 30.0)

    # ── Check missing critical fields ──
    critical_fields = ["txn_id", "amount", "status"]
    missing = [f for f in critical_fields if not extracted_fields.get(f)]
    if missing:
        red_flags.append(f"🟡 Missing critical fields: {', '.join(missing)}")
        confidence -= len(missing) * 5

    # ── Check duplicate status ──
    if duplicate_result.get("is_duplicate"):
        red_flags.append(
            f"🔴 Duplicate transaction detected — originally submitted at "
            f"{duplicate_result.get('original_submission_time', 'unknown time')}"
        )
        confidence -= 30

    # ── Check metadata analysis ──
    if metadata_result.get("is_edited"):
        for flag in metadata_result.get("flags", []):
            red_flags.append(f"🔴 Forensics: {flag}")
        confidence -= 40
    elif not metadata_result.get("has_exif"):
        # Just an observation, slight penalty for stripped metadata
        confidence -= 5

    # ── Clamp confidence ──
    confidence = max(0.0, min(100.0, confidence))

    # ── Determine verdict ──
    critical_count = sum(1 for i in issues if i.get("severity") == "critical")
    high_count = sum(1 for i in issues if i.get("severity") == "high")
    is_duplicate = duplicate_result.get("is_duplicate", False)

    if critical_count > 0 or confidence < 25 or (is_duplicate and high_count > 0) or metadata_result.get("is_edited"):
        verdict = "FAKE"
    elif high_count > 0 or confidence < 60 or is_duplicate or len(red_flags) >= 3:
        verdict = "SUSPICIOUS"
    else:
        verdict = "GENUINE"

    # ── Build reasoning ──
    reasoning_parts = []

    if integrity_result.get("analysis_summary"):
        reasoning_parts.append(integrity_result["analysis_summary"])

    if is_duplicate:
        reasoning_parts.append(
            f"This transaction ID has been previously submitted on "
            f"{duplicate_result.get('original_submission_time', 'an unknown date')}, "
            f"indicating potential reuse of the same receipt."
        )

    if not red_flags:
        reasoning_parts.append(
            "No red flags were detected. All extracted fields appear consistent and valid."
        )

    if not reasoning_parts:
        reasoning_parts.append("Analysis completed with limited data available.")

    reasoning_summary = " ".join(reasoning_parts)

    # ── Recommended action ──
    if verdict == "GENUINE":
        recommended_action = "Transaction appears authentic. Safe to accept."
    elif verdict == "SUSPICIOUS":
        recommended_action = "Manual review recommended. Cross-verify the transaction with the bank or payment app before accepting."
    else:
        recommended_action = "Do NOT accept this receipt. Strong indicators of fraud or manipulation detected. Report to relevant authorities if necessary."

    report = {
        "verdict": verdict,
        "confidence_score": round(confidence, 1),
        "reasoning_summary": reasoning_summary,
        "red_flags": red_flags if red_flags else ["None detected"],
        "recommended_action": recommended_action,
    }

    logger.info(f"Verdict generated: {verdict} (confidence: {confidence})")
    return report
