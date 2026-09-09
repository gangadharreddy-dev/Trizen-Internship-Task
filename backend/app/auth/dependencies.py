from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.user import User, UserRole
from app.auth.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_token(token)
    if not payload or payload.get("type") != "user_access":
        raise credentials_exception

    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

def require_authenticated_user(
    current_user: User = Depends(get_current_user)
) -> User:
    return current_user

def verify_customer_gallery_access(
    public_token: str,
    x_gallery_token: Optional[str] = Header(None, alias="X-Gallery-Token"),
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> dict:
    """
    Verifies that the customer has entered the valid PIN for this public_token
    and holds a signed session token. Accepts token via X-Gallery-Token header
    or Authorization: Bearer <token>.
    """
    token = x_gallery_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gallery PIN required. Please enter PIN to access this gallery."
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "gallery_customer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired gallery session token"
        )

    if payload.get("public_token") != public_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Session token is not valid for this gallery"
        )

    return payload
