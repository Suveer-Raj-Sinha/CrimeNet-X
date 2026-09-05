from fastapi import APIRouter, HTTPException, status, Response
from datetime import datetime, timezone, timedelta
from typing import Dict

from app.core.security import create_access_token, verify_password
from app.schemas.schemas import LoginRequest, TokenResponse
from app.store import db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Rate-limiting / lockout tracking dictionary
# Structure: { username: { "attempts": count, "lockout_until": datetime } }
FAILED_ATTEMPTS: Dict[str, dict] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response):
    username = payload.username.strip()
    now = datetime.now(timezone.utc)
    
    # 1. Rate limiting & lockout check
    user_failed_info = FAILED_ATTEMPTS.get(username, {"attempts": 0, "lockout_until": None})
    if user_failed_info["lockout_until"] and now < user_failed_info["lockout_until"]:
        remaining_seconds = int((user_failed_info["lockout_until"] - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked out due to multiple failed attempts. Try again in {remaining_seconds} seconds."
        )

    # 2. Database lookup
    user = db.get_user(username)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        # Track failed attempt
        user_failed_info["attempts"] += 1
        if user_failed_info["attempts"] >= MAX_FAILED_ATTEMPTS:
            user_failed_info["lockout_until"] = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            db.log_audit(username, "login_lockout", "auth", None, "account_locked")
        else:
            db.log_audit(username, "login", "auth", None, "failure")
            
        FAILED_ATTEMPTS[username] = user_failed_info
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password credentials.")

    # 3. Optional MFA verification check
    if payload.mfa_code:
        if payload.mfa_code.strip() != "123456":
            db.log_audit(username, "mfa_verify", "auth", None, "mfa_failed")
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid 6-digit Multi-Factor Authentication (MFA) code.")

    # Reset failed attempts on successful login
    FAILED_ATTEMPTS[username] = {"attempts": 0, "lockout_until": None}
    
    # 4. Generate JWT access token
    token = create_access_token(subject=user["username"], role=user["role"])
    
    # 5. Set HttpOnly, Secure, SameSite Cookie for secure login session
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True when served over Https in production
        max_age=3600 * 24
    )
    
    db.log_audit(user["username"], "login", "auth", None, "success")
    return TokenResponse(access_token=token, role=user["role"])
