import os
import hashlib
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import settings
from app.database.connection import get_db

try:
    from jose import JWTError, jwt
except ImportError:
    try:
        import jwt  # type: ignore
        JWTError = getattr(jwt, "PyJWTError", Exception)
    except ImportError:
        JWTError = Exception
        jwt = None

def get_password_hash(password: str) -> str:
    """Hashes password using native bcrypt with safe 72-byte truncation."""
    pwd_bytes = str(password).encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against bcrypt hash or sha256 fallback."""
    if not hashed_password:
        return False
    try:
        pwd_bytes = str(plain_password).encode('utf-8')[:72]
        if hashed_password.startswith("$2"):
            return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
        # Support fallback sha256 hashes if any existed
        return hashlib.sha256(str(plain_password).encode('utf-8')).hexdigest() == hashed_password
    except Exception:
        return hashlib.sha256(str(plain_password).encode('utf-8')).hexdigest() == hashed_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode('utf-8')
    return encoded_jwt

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Dependency returning the strictly authenticated user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token missing",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        email: Optional[str] = payload.get("email")
        if not user_id and not email:
            raise credentials_exception
    except (JWTError, Exception):
        raise credentials_exception

    db = get_db()
    user = None
    if user_id:
        user = await db["users"].find_one({"_id": user_id})
    if user is None and email:
        user = await db["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception

    return user
