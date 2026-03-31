"""
ProofMatch AI — Pydantic Models & Schemas
Defines all request/response models and data structures.
"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class Verdict(str, Enum):
    GENUINE = "GENUINE"
    SUSPICIOUS = "SUSPICIOUS"
    FAKE = "FAKE"


class VerificationStep(str, Enum):
    UPLOADING = "UPLOADING"
    EXTRACTING = "EXTRACTING"
    VERIFYING = "VERIFYING"
    CHECKING_DUPLICATES = "CHECKING_DUPLICATES"
    STORING = "STORING"
    GENERATING_REPORT = "GENERATING_REPORT"
    DONE = "DONE"


# ─── UPI Fields ──────────────────────────────────────────────────────────────

class UPIFields(BaseModel):
    """Extracted UPI transaction fields from screenshot."""
    txn_id: Optional[str] = Field(None, description="Transaction ID")
    amount: Optional[str] = Field(None, description="Transaction amount")
    amount_numeric: Optional[float] = Field(None, description="Numeric amount value")
    sender_upi: Optional[str] = Field(None, description="Sender UPI ID")
    receiver_upi: Optional[str] = Field(None, description="Receiver UPI ID")
    sender_name: Optional[str] = Field(None, description="Sender name")
    receiver_name: Optional[str] = Field(None, description="Receiver name")
    timestamp: Optional[str] = Field(None, description="Transaction timestamp")
    bank_ref_no: Optional[str] = Field(None, description="Bank reference number")
    payment_app: Optional[str] = Field(None, description="Payment app used")
    status: Optional[str] = Field(None, description="Transaction status")


# ─── Tool Results ─────────────────────────────────────────────────────────────

class IntegrityIssue(BaseModel):
    """A single integrity issue found during verification."""
    issue_type: str = Field(..., description="Type of issue: font, timestamp, amount, format, etc.")
    description: str = Field(..., description="Human-readable description of the issue")
    severity: str = Field("medium", description="Severity: low, medium, high, critical")


class IntegrityResult(BaseModel):
    """Result from the transaction integrity verification tool."""
    confidence_score: float = Field(..., ge=0, le=100, description="Confidence score 0-100")
    integrity_issues: list[IntegrityIssue] = Field(default_factory=list)
    analysis_summary: str = Field("", description="Summary of the integrity analysis")


class DuplicateCheckResult(BaseModel):
    """Result from the duplicate check tool."""
    is_duplicate: bool = Field(False, description="Whether this transaction was previously submitted")
    original_submission_time: Optional[str] = Field(None, description="When the original was submitted")
    original_submission_id: Optional[str] = Field(None, description="Document ID of original submission")


class VerdictReport(BaseModel):
    """Final verdict report combining all tool results."""
    verdict: Verdict = Field(..., description="Final verdict: GENUINE, SUSPICIOUS, or FAKE")
    confidence_score: float = Field(..., ge=0, le=100, description="Overall confidence score")
    reasoning_summary: str = Field(..., description="Human-readable reasoning for the verdict")
    red_flags: list[str] = Field(default_factory=list, description="List of detected red flags")
    recommended_action: str = Field("", description="Recommended action for the user")


# ─── Verification Record ─────────────────────────────────────────────────────

class VerificationRecord(BaseModel):
    """Full verification record stored in Firestore."""
    id: Optional[str] = Field(None, description="Document ID")
    txn_id: Optional[str] = None
    verdict: Verdict = Verdict.SUSPICIOUS
    confidence_score: float = 0.0
    reasoning_summary: str = ""
    red_flags: list[str] = Field(default_factory=list)
    recommended_action: str = ""
    extracted_fields: Optional[UPIFields] = None
    integrity_result: Optional[IntegrityResult] = None
    duplicate_check: Optional[DuplicateCheckResult] = None
    metadata_analysis: Optional[dict] = None
    image_uri: str = ""
    submitted_by: str = ""
    submitted_by_email: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ─── API Response Envelope ────────────────────────────────────────────────────

class APIResponse(BaseModel):
    """Standardized API response envelope."""
    success: bool = True
    data: Optional[Any] = None
    error: Optional[str] = None
    request_id: Optional[str] = None


# ─── Request Models ──────────────────────────────────────────────────────────

class VerifyRequest(BaseModel):
    """Request model for the verify endpoint."""
    image_uri: str = Field(..., description="GCS URI or local path of the uploaded image")


# ─── Stats Models ────────────────────────────────────────────────────────────

class VerificationStats(BaseModel):
    """Aggregate verification statistics."""
    total_verifications: int = 0
    genuine_count: int = 0
    suspicious_count: int = 0
    fake_count: int = 0
    genuine_percentage: float = 0.0
    suspicious_percentage: float = 0.0
    fake_percentage: float = 0.0
    average_confidence: float = 0.0
