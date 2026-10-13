import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.connection import get_db
from app.database.models import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    db = get_db()
    existing_user = await db["users"].find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="A student account with this email already exists.")

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "id": user_id,
        "email": user_in.email,
        "full_name": user_in.full_name,
        "hashed_password": get_password_hash(user_in.password),
        "created_at": datetime.utcnow()
    }
    await db["users"].insert_one(user_doc)

    access_token = create_access_token(data={"sub": user_id, "email": user_in.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user_in.email,
            "full_name": user_in.full_name,
            "created_at": user_doc["created_at"]
        }
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_db()
    user = await db["users"].find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(user.get("_id"))
    access_token = create_access_token(data={"sub": user_id, "email": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "full_name": user.get("full_name", "Student"),
            "created_at": user.get("created_at", datetime.utcnow())
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user.get("_id")),
        "email": current_user.get("email"),
        "full_name": current_user.get("full_name", "Student"),
        "created_at": current_user.get("created_at", datetime.utcnow())
    }
