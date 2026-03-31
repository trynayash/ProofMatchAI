"""
ProofMatch AI — Firebase Authentication Middleware
Verifies Firebase ID tokens from the Authorization header.
"""

import logging
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from config import settings

logger = logging.getLogger("proofmatch.auth")
security = HTTPBearer(auto_error=False)

# Lazy-init Firebase Admin
_firebase_app = None


def _init_firebase():
    """Initialize Firebase Admin SDK (once)."""
    global _firebase_app
    if _firebase_app is not None:
        return
    try:
        import firebase_admin
        from firebase_admin import credentials

        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
            _firebase_app = firebase_admin.initialize_app(cred)
        else:
            _firebase_app = firebase_admin.initialize_app()
        logger.info("Firebase Admin SDK initialized")
    except Exception as e:
        logger.warning(f"Firebase Admin SDK initialization failed: {e}")
        _firebase_app = None


def verify_firebase_token(token: str) -> dict:
    """Verify a Firebase ID token and return decoded claims."""
    _init_firebase()
    try:
        from firebase_admin import auth
        decoded = auth.verify_id_token(token)
        return {
            "uid": decoded.get("uid", ""),
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
            "picture": decoded.get("picture", ""),
        }
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware that verifies Firebase auth tokens on protected routes."""

    # Routes that do not require authentication
    PUBLIC_PATHS = {"/", "/api/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"}

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip auth for public paths and OPTIONS (CORS preflight)
        if path in self.PUBLIC_PATHS or request.method == "OPTIONS":
            request.state.user = {"uid": "anonymous", "email": "", "name": "Anonymous"}
            return await call_next(request)

        # Skip auth if disabled (local development)
        if settings.AUTH_DISABLED:
            request.state.user = {
                "uid": "dev-user",
                "email": "dev@proofmatch.ai",
                "name": "Development User",
            }
            return await call_next(request)

        # Extract Bearer token
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing authentication token")

        token = auth_header.split("Bearer ", 1)[1]
        user = verify_firebase_token(token)
        request.state.user = user

        return await call_next(request)
