"""
ProofMatch AI — FastAPI Application
Main entry point with all API routes, middleware, and error handling.
"""

import os
import uuid
import base64
import logging
from datetime import datetime
from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from models import APIResponse
from middleware.auth import AuthMiddleware

# ── Logging Setup ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("proofmatch.api")

# ── Rate Limiter ──
limiter = Limiter(key_func=get_remote_address)

# ── FastAPI App ──
app = FastAPI(
    title="ProofMatch AI",
    description="AI-Powered UPI Payment Screenshot Verification System",
    version="1.0.0",
)

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth Middleware ──
app.add_middleware(AuthMiddleware)

# ── Rate Limit Error Handler ──
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return APIResponse(
        success=False,
        error="Rate limit exceeded. Maximum 10 verifications per hour.",
        request_id=str(uuid.uuid4()),
    ).model_dump()


# ── Ensure upload directory exists ──
os.makedirs(settings.LOCAL_UPLOAD_DIR, exist_ok=True)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return APIResponse(
        success=True,
        data={
            "status": "healthy",
            "service": "proofmatch-ai",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.post("/api/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    """Upload a UPI payment screenshot."""
    request_id = str(uuid.uuid4())
    user = request.state.user

    logger.info(f"[{request_id}] Upload request from user {user.get('uid')}")

    # Validate file type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {content_type}. Allowed: JPG, PNG, WEBP",
        )

    # Read and validate file size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large: {size_mb:.1f}MB. Maximum: {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Store file
    file_ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    filename = f"{uuid.uuid4()}.{file_ext}"

    # Try GCS first, fall back to local
    file_uri = ""
    try:
        from google.cloud import storage as gcs_storage
        client = gcs_storage.Client()
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        blob = bucket.blob(f"uploads/{filename}")
        blob.upload_from_string(contents, content_type=content_type)
        file_uri = f"gs://{settings.GCS_BUCKET_NAME}/uploads/{filename}"
        logger.info(f"[{request_id}] Uploaded to GCS: {file_uri}")
    except Exception as e:
        logger.warning(f"[{request_id}] GCS upload failed, using local storage: {e}")
        local_path = os.path.join(settings.LOCAL_UPLOAD_DIR, filename)
        with open(local_path, "wb") as f:
            f.write(contents)
        file_uri = f"local://{local_path}"
        logger.info(f"[{request_id}] Saved locally: {file_uri}")

    # Return base64 along with URI for verification
    image_base64 = base64.b64encode(contents).decode("utf-8")

    return APIResponse(
        success=True,
        data={
            "file_uri": file_uri,
            "filename": filename,
            "size_mb": round(size_mb, 2),
            "mime_type": content_type,
            "image_base64": image_base64,
        },
        request_id=request_id,
    )


@app.post("/api/verify")
@limiter.limit(settings.RATE_LIMIT)
async def verify_screenshot(request: Request):
    """Trigger the ProofMatch verification agent pipeline."""
    request_id = str(uuid.uuid4())
    user = request.state.user
    logger.info(f"[{request_id}] Verify request from user {user.get('uid')}")

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request body")

    image_base64 = body.get("image_base64")
    mime_type = body.get("mime_type", "image/png")
    image_uri = body.get("image_uri", "")

    if not image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")

    # Run the verification pipeline
    from agent import run_verification_pipeline

    try:
        result = await run_verification_pipeline(
            image_base64=image_base64,
            mime_type=mime_type,
            user_id=user.get("uid", "anonymous"),
        )

        # Attach image URI to the stored record
        if image_uri and result.get("document_id"):
            try:
                from tools.storage import _get_firestore
                db = _get_firestore()
                if db:
                    db.collection("verifications").document(result["document_id"]).update({"image_uri": image_uri})
            except Exception:
                pass

        return APIResponse(success=True, data=result, request_id=request_id)

    except Exception as e:
        logger.error(f"[{request_id}] Verification pipeline error: {e}")
        return APIResponse(
            success=False,
            error=f"Verification failed: {str(e)}",
            request_id=request_id,
        )


@app.get("/api/history")
async def get_history(request: Request):
    """Get verification history for the logged-in user."""
    request_id = str(uuid.uuid4())
    user = request.state.user

    from tools.storage import get_user_history
    records = await get_user_history(user.get("uid", ""))

    return APIResponse(success=True, data=records, request_id=request_id)


@app.get("/api/transaction/{doc_id}")
async def get_transaction(doc_id: str, request: Request):
    """Get a single verification record."""
    request_id = str(uuid.uuid4())

    from tools.storage import get_record_by_id
    record = await get_record_by_id(doc_id)

    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found")

    return APIResponse(success=True, data=record, request_id=request_id)


@app.get("/api/stats")
async def get_stats(request: Request):
    """Get aggregate verification statistics."""
    request_id = str(uuid.uuid4())
    user = request.state.user

    from tools.storage import get_verification_stats

    # If admin, get all stats; otherwise, user-specific
    user_id = None if user.get("role") == "admin" else user.get("uid", "")
    stats = await get_verification_stats(user_id)

    return APIResponse(success=True, data=stats, request_id=request_id)


@app.post("/api/report/pdf")
async def generate_pdf_report(request: Request):
    """Generate a downloadable PDF report for a verification."""
    request_id = str(uuid.uuid4())

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request body")

    doc_id = body.get("document_id")
    if not doc_id:
        raise HTTPException(status_code=400, detail="document_id is required")

    from tools.storage import get_record_by_id
    record = await get_record_by_id(doc_id)

    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found")

    # Generate PDF
    from fpdf import FPDF

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 15, "ProofMatch AI - Verification Report", ln=True, align="C")
    pdf.ln(5)

    # Verdict
    verdict = record.get("verdict", "UNKNOWN")
    confidence = record.get("confidence_score", 0)
    pdf.set_font("Helvetica", "B", 16)

    if verdict == "GENUINE":
        pdf.set_text_color(34, 139, 34)
    elif verdict == "SUSPICIOUS":
        pdf.set_text_color(255, 165, 0)
    else:
        pdf.set_text_color(220, 20, 60)

    pdf.cell(0, 12, f"Verdict: {verdict}", ln=True, align="C")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, f"Confidence Score: {confidence}%", ln=True, align="C")
    pdf.ln(10)

    # Transaction Details
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Transaction Details", ln=True)
    pdf.set_font("Helvetica", "", 11)

    fields = record.get("extracted_fields", {})
    if isinstance(fields, dict):
        detail_items = [
            ("Transaction ID", fields.get("txn_id", "N/A")),
            ("Amount", fields.get("amount", "N/A")),
            ("Sender", fields.get("sender_upi", "N/A")),
            ("Receiver", fields.get("receiver_upi", "N/A")),
            ("Date/Time", fields.get("timestamp", "N/A")),
            ("Payment App", fields.get("payment_app", "N/A")),
            ("Status", fields.get("status", "N/A")),
            ("Bank Ref", fields.get("bank_ref_no", "N/A")),
        ]
        for label, value in detail_items:
            pdf.cell(60, 7, f"{label}:", ln=False)
            pdf.cell(0, 7, str(value) if value else "N/A", ln=True)
    pdf.ln(5)

    # Red Flags
    red_flags = record.get("red_flags", [])
    if red_flags:
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Red Flags", ln=True)
        pdf.set_font("Helvetica", "", 11)
        for flag in red_flags:
            clean_flag = flag.encode('ascii', 'replace').decode('ascii')
            pdf.cell(0, 7, f"  - {clean_flag}", ln=True)
        pdf.ln(5)

    # Reasoning
    reasoning = record.get("reasoning_summary", "")
    if reasoning:
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "AI Reasoning", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, reasoning)
        pdf.ln(5)

    # Recommended Action
    action = record.get("recommended_action", "")
    if action:
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Recommended Action", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, action)
        pdf.ln(5)

    # Footer
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 10, f"Generated by ProofMatch AI on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", ln=True, align="C")
    pdf.cell(0, 6, f"Report ID: {doc_id}", ln=True, align="C")

    # Return PDF
    pdf_bytes = pdf.output()
    buffer = BytesIO(pdf_bytes)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=proofmatch_report_{doc_id[:8]}.pdf"},
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STARTUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.on_event("startup")
async def startup():
    logger.info("ProofMatch AI starting up...")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Auth disabled: {settings.AUTH_DISABLED}")
    logger.info(f"CORS origins: {settings.ALLOWED_ORIGINS}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
