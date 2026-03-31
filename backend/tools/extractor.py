"""
ProofMatch AI — Tool 1: UPI Field Extraction
Uses Gemini Vision API to extract structured UPI transaction fields from a payment screenshot.
"""

import json
import logging
import base64
from typing import Optional
from google import genai
from google.genai import types
from config import settings

logger = logging.getLogger("proofmatch.tools.extractor")

EXTRACTION_PROMPT = """You are an expert at reading UPI payment receipt screenshots.

Analyze this UPI payment screenshot carefully and extract all visible transaction details.

Return ONLY a valid JSON object with exactly these fields (use null for any field not found):

{
  "txn_id": "The UPI transaction ID or reference number",
  "amount": "The transaction amount as shown (e.g., '₹1,500.00')",
  "amount_numeric": 1500.00,
  "sender_upi": "Sender's UPI ID (e.g., user@upi)",
  "receiver_upi": "Receiver's UPI ID (e.g., merchant@upi)",
  "sender_name": "Sender's name if visible",
  "receiver_name": "Receiver's name if visible",
  "timestamp": "Transaction date/time as shown on screenshot",
  "bank_ref_no": "Bank reference number if shown",
  "payment_app": "The payment app used (GPay, PhonePe, Paytm, etc.)",
  "status": "Transaction status (Success, Failed, Pending, etc.)"
}

Rules:
- Extract ONLY what is clearly visible in the image
- Do NOT guess or fabricate any values
- For amount_numeric, convert the displayed amount to a plain number (no currency symbols)
- If a field is partially visible or unclear, set it to null
- Return ONLY the JSON object, no other text"""


async def extract_upi_fields(image_base64: str, mime_type: str = "image/png") -> dict:
    """
    Extract UPI transaction fields from a payment screenshot using Gemini Vision.

    Args:
        image_base64: Base64-encoded image data
        mime_type: MIME type of the image (image/png, image/jpeg, image/webp)

    Returns:
        Dictionary with extracted UPI fields
    """
    logger.info("Starting UPI field extraction with Gemini Vision")

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        image_bytes = base64.b64decode(image_base64)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                        types.Part.from_text(text=EXTRACTION_PROMPT),
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=2048,
            ),
        )

        response_text = response.text.strip()
        # Clean markdown code fences if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
            response_text = response_text.strip()

        extracted = json.loads(response_text)
        logger.info(f"Successfully extracted fields: txn_id={extracted.get('txn_id')}")
        return extracted

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        return {
            "txn_id": None, "amount": None, "amount_numeric": None,
            "sender_upi": None, "receiver_upi": None, "sender_name": None,
            "receiver_name": None, "timestamp": None, "bank_ref_no": None,
            "payment_app": None, "status": None,
            "_extraction_error": f"Failed to parse AI response: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        return {
            "txn_id": None, "amount": None, "amount_numeric": None,
            "sender_upi": None, "receiver_upi": None, "sender_name": None,
            "receiver_name": None, "timestamp": None, "bank_ref_no": None,
            "payment_app": None, "status": None,
            "_extraction_error": str(e)
        }
