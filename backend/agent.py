"""
ProofMatch AI — ADK Agent Definition
Multi-tool agent using Google Agent Development Kit for UPI payment fraud detection.
"""

import logging
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from tools.extractor import extract_upi_fields
from tools.verifier import verify_transaction_integrity
from tools.duplicate import check_duplicate
from tools.reporter import generate_verdict_report
from tools.metadata import analyze_image_metadata

logger = logging.getLogger("proofmatch.agent")

AGENT_SYSTEM_PROMPT = """You are ProofMatch, an expert forensic AI agent specializing in UPI payment fraud detection.

Your job is to thoroughly analyze UPI payment screenshots for authenticity. You have access to the following tools:

1. **extract_upi_fields** — Extracts structured transaction data from a UPI payment screenshot
2. **analyze_image_metadata** — Extracts EXIF data to detect Photoshop or manipulation software
3. **verify_transaction_integrity** — Checks the extracted data for fraud signals and inconsistencies
4. **check_duplicate** — Checks if this transaction has been previously submitted
5. **generate_verdict_report** — Produces the final verdict combining all analysis results

Follow this exact workflow for every verification:
1. Call extract_upi_fields with the image to get structured transaction data
2. Call analyze_image_metadata with the image to check for software manipulation
3. Call verify_transaction_integrity with the extracted data to check for fraud signals
4. Call check_duplicate with the transaction ID to detect reuse
5. Call generate_verdict_report with all results to produce the final verdict

Rules:
- Be precise, systematic, and always explain your reasoning clearly
- Never guess — base every conclusion on observable evidence from the image and data
- If any tool fails, continue with remaining tools and note the failure in the report
- Always provide a final verdict even with partial data"""


def create_agent() -> Agent:
    """Create and return the ProofMatch ADK Agent."""
    logger.info("Creating ProofMatch ADK Agent")

    agent = Agent(
        name="ProofMatchAgent",
        model="gemini-2.0-flash",
        instruction=AGENT_SYSTEM_PROMPT,
        tools=[
            extract_upi_fields,
            analyze_image_metadata,
            verify_transaction_integrity,
            check_duplicate,
            generate_verdict_report,
        ],
    )

    logger.info("ProofMatch ADK Agent created successfully")
    return agent


async def run_verification_pipeline(image_base64: str, mime_type: str, user_id: str) -> dict:
    """
    Run the full verification pipeline directly (without ADK orchestration).
    This is a deterministic pipeline that calls each tool in sequence.

    Args:
        image_base64: Base64-encoded image data
        mime_type: MIME type of the image
        user_id: ID of the user who submitted the verification

    Returns:
        Complete verification result dictionary
    """
    logger.info(f"Starting verification pipeline for user {user_id}")

    result = {
        "extracted_fields": None,
        "metadata_analysis": None,
        "integrity_result": None,
        "duplicate_check": None,
        "verdict_report": None,
        "errors": [],
    }

    # Step 1: Extract UPI fields
    try:
        logger.info("Step 1: Extracting UPI fields")
        extracted = await extract_upi_fields(image_base64, mime_type)
        result["extracted_fields"] = extracted
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        result["errors"].append(f"Extraction failed: {str(e)}")
        extracted = {}

    # Step 1.5: Metadata Analysis
    try:
        logger.info("Step 1.5: Analyzing image metadata")
        metadata = await analyze_image_metadata(image_base64)
        result["metadata_analysis"] = metadata
    except Exception as e:
        logger.error(f"Metadata analysis failed: {e}")
        result["errors"].append(f"Metadata analysis failed: {str(e)}")
        metadata = {"is_edited": False, "flags": [], "metadata_summary": "Analysis skipped"}

    # Step 2: Verify integrity
    try:
        logger.info("Step 2: Verifying transaction integrity")
        integrity = await verify_transaction_integrity(extracted)
        result["integrity_result"] = integrity
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        result["errors"].append(f"Verification failed: {str(e)}")
        integrity = {"confidence_score": 50, "integrity_issues": [], "analysis_summary": "Verification skipped due to error."}

    # Step 3: Check for duplicates
    try:
        logger.info("Step 3: Checking for duplicates")
        txn_id = extracted.get("txn_id", "")
        duplicate = await check_duplicate(txn_id)
        result["duplicate_check"] = duplicate
    except Exception as e:
        logger.error(f"Duplicate check failed: {e}")
        result["errors"].append(f"Duplicate check failed: {str(e)}")
        duplicate = {"is_duplicate": False, "original_submission_time": None, "original_submission_id": None}

    # Step 4: Generate verdict report
    try:
        logger.info("Step 4: Generating verdict report")
        verdict = await generate_verdict_report(extracted, integrity, duplicate, metadata)
        result["verdict_report"] = verdict
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        result["errors"].append(f"Report generation failed: {str(e)}")
        result["verdict_report"] = {
            "verdict": "SUSPICIOUS",
            "confidence_score": 0,
            "reasoning_summary": f"Could not generate complete report: {str(e)}",
            "red_flags": ["Report generation error"],
            "recommended_action": "Manual review required.",
        }

    # Step 5: Store result
    from tools.storage import store_verification_result

    storage_payload = {
        "txn_id": extracted.get("txn_id"),
        "verdict": result["verdict_report"]["verdict"],
        "confidence_score": result["verdict_report"]["confidence_score"],
        "reasoning_summary": result["verdict_report"]["reasoning_summary"],
        "red_flags": result["verdict_report"]["red_flags"],
        "recommended_action": result["verdict_report"]["recommended_action"],
        "extracted_fields": extracted,
        "metadata_analysis": metadata,
        "integrity_result": integrity,
        "duplicate_check": duplicate,
        "submitted_by": user_id,
        "image_uri": "",
    }

    try:
        logger.info("Step 5: Storing verification result")
        store_result = await store_verification_result(storage_payload)
        result["document_id"] = store_result.get("document_id")
    except Exception as e:
        logger.error(f"Storage failed: {e}")
        result["errors"].append(f"Storage failed: {str(e)}")

    logger.info(f"Pipeline complete: verdict={result['verdict_report']['verdict']}")
    return result
