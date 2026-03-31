"""
ProofMatch AI — Tool 3: Duplicate Transaction Check
Queries Firestore for existing transactions with the same transaction ID.
"""

import logging
from datetime import datetime
from typing import Optional
from config import settings

logger = logging.getLogger("proofmatch.tools.duplicate")

# Lazy Firestore client
_firestore_client = None


def _get_firestore():
    """Get or create Firestore client."""
    global _firestore_client
    if _firestore_client is not None:
        return _firestore_client

    try:
        from google.cloud import firestore
        _firestore_client = firestore.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        logger.info("Firestore client initialized")
        return _firestore_client
    except Exception as e:
        logger.warning(f"Firestore unavailable: {e}. Using in-memory fallback.")
        return None


# In-memory duplicate store for local development
_local_store: dict = {}


async def check_duplicate(txn_id: str) -> dict:
    """
    Check if a transaction ID has been previously submitted.

    Args:
        txn_id: The UPI transaction ID to check

    Returns:
        Dictionary with is_duplicate, original_submission_time, original_submission_id
    """
    if not txn_id:
        return {
            "is_duplicate": False,
            "original_submission_time": None,
            "original_submission_id": None,
        }

    logger.info(f"Checking for duplicate transaction: {txn_id}")

    db = _get_firestore()

    if db is not None:
        try:
            docs = (
                db.collection("verifications")
                .where("txn_id", "==", txn_id)
                .limit(1)
                .stream()
            )

            for doc in docs:
                data = doc.to_dict()
                logger.info(f"Duplicate found: {doc.id}")
                return {
                    "is_duplicate": True,
                    "original_submission_time": data.get("created_at", "Unknown"),
                    "original_submission_id": doc.id,
                }

            return {
                "is_duplicate": False,
                "original_submission_time": None,
                "original_submission_id": None,
            }

        except Exception as e:
            logger.error(f"Firestore query failed: {e}")
            # Fall through to local store
    
    # Local development fallback
    if txn_id in _local_store:
        record = _local_store[txn_id]
        return {
            "is_duplicate": True,
            "original_submission_time": record.get("created_at", "Unknown"),
            "original_submission_id": record.get("id", "local"),
        }

    return {
        "is_duplicate": False,
        "original_submission_time": None,
        "original_submission_id": None,
    }


def register_local_txn(txn_id: str, record: dict):
    """Register a transaction in the local store (dev mode)."""
    if txn_id:
        _local_store[txn_id] = record
