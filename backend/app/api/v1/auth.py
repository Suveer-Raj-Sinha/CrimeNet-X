from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, verify_password
from app.schemas.schemas import LoginRequest, TokenResponse
from app.store import db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    user = db.get_user(payload.username)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        db.log_audit(payload.username, "login", "auth", None, "failure")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    token = create_access_token(subject=user["username"], role=user["role"])
    db.log_audit(user["username"], "login", "auth", None, "success")
    return TokenResponse(access_token=token, role=user["role"])
