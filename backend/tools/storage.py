"""
ProofMatch AI — Tool 4: Verification Result Storage
Saves verification records to Firestore (or in-memory store for local dev).
"""

import logging
import uuid
from datetime import datetime
from config import settings

logger = logging.getLogger("proofmatch.tools.storage")

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
        logger.info("Firestore client initialized for storage")
        return _firestore_client
    except Exception as e:
        logger.warning(f"Firestore unavailable for storage: {e}")
        return None


# In-memory store for local development
_local_records: list[dict] = []


async def store_verification_result(payload: dict) -> dict:
    """
    Store a verification result in Firestore.

    Args:
        payload: Full verification record dictionary

    Returns:
        Dictionary with document_id and status
    """
    logger.info(f"Storing verification result for txn_id={payload.get('txn_id')}")

    doc_id = str(uuid.uuid4())
    payload["id"] = doc_id
    payload["created_at"] = payload.get("created_at", datetime.utcnow().isoformat())

    db = _get_firestore()

    if db is not None:
        try:
            db.collection("verifications").document(doc_id).set(payload)
            logger.info(f"Stored to Firestore: {doc_id}")
            return {"document_id": doc_id, "status": "stored", "storage": "firestore"}
        except Exception as e:
            logger.error(f"Firestore write failed: {e}")
            # Fall through to local

    # Local development fallback
    _local_records.append(payload)

    # Also register in duplicate checker's local store
    from tools.duplicate import register_local_txn
    register_local_txn(payload.get("txn_id", ""), payload)

    logger.info(f"Stored locally: {doc_id}")
    return {"document_id": doc_id, "status": "stored", "storage": "local"}


async def get_user_history(user_id: str) -> list[dict]:
    """Get verification history for a specific user."""
    db = _get_firestore()

    if db is not None:
        try:
            docs = (
                db.collection("verifications")
                .where("submitted_by", "==", user_id)
                .order_by("created_at", direction="DESCENDING")
                .limit(100)
                .stream()
            )
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore query failed: {e}")

    # Local fallback
    return [r for r in reversed(_local_records) if r.get("submitted_by") == user_id]


async def get_all_history() -> list[dict]:
    """Get all verification records (admin)."""
    db = _get_firestore()

    if db is not None:
        try:
            docs = (
                db.collection("verifications")
                .order_by("created_at", direction="DESCENDING")
                .limit(500)
                .stream()
            )
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore query failed: {e}")

    return list(reversed(_local_records))


async def get_record_by_id(doc_id: str) -> dict | None:
    """Get a single verification record by ID."""
    db = _get_firestore()

    if db is not None:
        try:
            doc = db.collection("verifications").document(doc_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            logger.error(f"Firestore read failed: {e}")

    # Local fallback
    for record in _local_records:
        if record.get("id") == doc_id:
            return record
    return None


async def get_verification_stats(user_id: str | None = None) -> dict:
    """Get aggregate verification statistics."""
    if user_id:
        records = await get_user_history(user_id)
    else:
        records = await get_all_history()

    total = len(records)
    if total == 0:
        return {
            "total_verifications": 0,
            "genuine_count": 0, "suspicious_count": 0, "fake_count": 0,
            "genuine_percentage": 0, "suspicious_percentage": 0, "fake_percentage": 0,
            "average_confidence": 0,
        }

    genuine = sum(1 for r in records if r.get("verdict") == "GENUINE")
    suspicious = sum(1 for r in records if r.get("verdict") == "SUSPICIOUS")
    fake = sum(1 for r in records if r.get("verdict") == "FAKE")
    avg_conf = sum(r.get("confidence_score", 0) for r in records) / total

    return {
        "total_verifications": total,
        "genuine_count": genuine,
        "suspicious_count": suspicious,
        "fake_count": fake,
        "genuine_percentage": round((genuine / total) * 100, 1) if total else 0,
        "suspicious_percentage": round((suspicious / total) * 100, 1) if total else 0,
        "fake_percentage": round((fake / total) * 100, 1) if total else 0,
        "average_confidence": round(avg_conf, 1),
    }
