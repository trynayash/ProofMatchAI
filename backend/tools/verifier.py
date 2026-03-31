"""
ProofMatch AI — Tool 2: Transaction Integrity Verification
Uses Gemini to analyze extracted data for fraud signals and inconsistencies.
"""

import json
import logging
from google import genai
from google.genai import types
from config import settings

logger = logging.getLogger("proofmatch.tools.verifier")

VERIFICATION_PROMPT_TEMPLATE = """You are a forensic payment fraud analyst. Analyze the following extracted UPI transaction data for signs of tampering, manipulation, or inconsistency.

Extracted Transaction Data:
{extracted_data}

Perform these checks:
1. **Format Consistency**: Are UPI IDs in valid format (xxx@bankname)? Is the amount format correct?
2. **Timestamp Validity**: Is the timestamp realistic? Is it in the future? Is the date format consistent with Indian UPI apps?
3. **Amount Consistency**: If both text and numeric amounts are present, do they match?
4. **Field Completeness**: Are critical fields (txn_id, amount, status) present?
5. **Status Logic**: Does the status make sense given other fields?
6. **Bank Reference**: Is the bank reference number in a plausible format?
7. **App Consistency**: Is the payment app name a recognized UPI app?
8. **General Red Flags**: Any other anomalies or suspicious patterns?

Return ONLY a valid JSON object:
{{
  "confidence_score": <number 0-100, where 100 = completely genuine>,
  "integrity_issues": [
    {{
      "issue_type": "<font|timestamp|amount|format|completeness|logic|reference|app|other>",
      "description": "<clear description of the issue>",
      "severity": "<low|medium|high|critical>"
    }}
  ],
  "analysis_summary": "<2-3 sentence summary of overall analysis>"
}}

If no issues are found, return an empty integrity_issues array with a high confidence_score.
Return ONLY the JSON object, no other text."""


async def verify_transaction_integrity(extracted_data: dict) -> dict:
    """
    Verify the integrity of extracted UPI transaction data.

    Args:
        extracted_data: Dictionary of extracted UPI fields

    Returns:
        Dictionary with confidence_score, integrity_issues[], and analysis_summary
    """
    logger.info("Starting transaction integrity verification")

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = VERIFICATION_PROMPT_TEMPLATE.format(
            extracted_data=json.dumps(extracted_data, indent=2, default=str)
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[types.Content(parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=2048,
            ),
        )

        response_text = response.text.strip()
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
            response_text = response_text.strip()

        result = json.loads(response_text)
        logger.info(f"Integrity verification complete: score={result.get('confidence_score')}, issues={len(result.get('integrity_issues', []))}")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse verification response: {e}")
        return {
            "confidence_score": 50.0,
            "integrity_issues": [{
                "issue_type": "other",
                "description": f"Automated verification encountered a parsing error: {str(e)}",
                "severity": "medium"
            }],
            "analysis_summary": "Verification could not be fully completed due to a parsing error. Manual review recommended."
        }
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        return {
            "confidence_score": 50.0,
            "integrity_issues": [{
                "issue_type": "other",
                "description": f"Verification error: {str(e)}",
                "severity": "medium"
            }],
            "analysis_summary": f"Verification encountered an error: {str(e)}"
        }
