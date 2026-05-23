from fastapi import APIRouter, Depends, HTTPException, status, Form, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
import models
import schemas
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    get_current_user,
    oauth2_scheme,
    limiter
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=schemas.TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db),
    redirect_uri: str = None
):
    """
    Authenticate a user.
    """
    # Validate callback URL if provided
    if redirect_uri:
        allowed_urls = os.environ.get("ALLOWED_CALLBACK_URLS", "").split(",")
        # Check if redirect_uri starts with any allowed url
        is_allowed = any(redirect_uri.startswith(allowed.strip()) for allowed in allowed_urls if allowed.strip())
        if allowed_urls and not is_allowed:
            raise HTTPException(status_code=400, detail="Invalid redirect_uri")

    # Search strictly by email
    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    # JIT Migration: If not found in users, check legacy students table strictly by email
    if not user:
        legacy_student = db.query(models.Student).filter(
            models.Student.email == form_data.username
        ).first()
        if legacy_student and verify_password(form_data.password, legacy_student.password_hash):
            user = models.User(
                username=legacy_student.username,
                full_name=legacy_student.name,
                email=legacy_student.email,
                password_hash=legacy_student.password_hash,
                created_by="migration",
                created_from="legacy_login"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            student_role = db.query(models.Role).filter(models.Role.role_name == "Student").first()
            if not student_role:
                student_role = models.Role(role_name="Student", created_by="migration", created_from="legacy_login")
                db.add(student_role)
                db.commit()
                db.refresh(student_role)
                
            db.add(models.UserRole(
                user_id=user.user_id,
                role_id=student_role.role_id,
                created_by="migration",
                created_from="legacy_login",
                token_expiry=datetime.utcnow() + timedelta(days=365)
            ))
            db.commit()

    ip_address = request.client.host if request.client else "unknown"
    device_info = request.headers.get("user-agent", "unknown")
    now = datetime.utcnow()

    if not user or not verify_password(form_data.password, user.password_hash):
        log_failed = models.LoginLog(
            user_id=user.user_id if user else None,
            ip_address=ip_address,
            device_info=device_info,
            status="Failed",
            login_time=now,
            created_at=now,
            updated_at=now
        )
        db.add(log_failed)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Log success
    log_success = models.LoginLog(
        user_id=user.user_id,
        ip_address=ip_address,
        device_info=device_info,
        status="Success",
        login_time=now,
        created_at=now,
        updated_at=now
    )
    db.add(log_success)

    # Extract roles and permissions
    user_roles = [ur.role.role_name for ur in user.user_roles if ur.role]
    primary_role = user_roles[0] if user_roles else "Guest"
    
    # Flatten permissions from all roles
    permissions = []
    for ur in user.user_roles:
        if ur.role and ur.role.permissions:
            permissions.extend(ur.role.permissions)
    permissions = list(set(permissions)) # Unique permissions

    # Access Token
    access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "email": user.email,
            "role": primary_role,
            "user_id": user.user_id,
            "username": user.username,
            "full_name": user.full_name
        },
        expires_delta=access_expires,
    )

    # Refresh Token
    refresh_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data={"sub": user.email})

    # CLEANUP: Remove ANY existing tokens for this user (to keep DB clean/no duplicates)
    db.query(models.UserToken).filter(models.UserToken.user_id == user.user_id).delete()
    
    # Store NEW token in DB
    now = datetime.utcnow()
    db_token = models.UserToken(
        user_id=user.user_id,
        token=access_token,
        refresh_token=refresh_token,
        expiry_date=now + access_expires,
        refresh_token_expiry=now + refresh_expires,
        is_active=True,
        created_at=now,
        updated_at=now,
        created_by=user.email,
        created_from=request.client.host if request.client else "unknown",
        token_expiry=now + access_expires
    )
    db.add(db_token)
    
    # Update user audit info
    user.updated_by = user.email
    user.updated_at = now
    
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "role": primary_role,
        "user_id": user.user_id,
        "username": user.username,
        "full_name": user.full_name,
        "permissions": permissions,
        "created_at": db_token.created_at,
        "updated_at": db_token.updated_at,
    }


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
def register(request: Request, payload: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    New users get the 'Guest' role by default.
    """
    # Check if email is already registered
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with audit fields
    new_user = models.User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        created_by=payload.email, # Initial creation is by the user themselves
        created_from=request.client.host if request.client else "unknown"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Assign Guest role (create if not exists)
    guest_role = db.query(models.Role).filter(models.Role.role_name == "Guest").first()
    if not guest_role:
        guest_role = models.Role(
            role_name="Guest", 
            description="Default role with minimum permissions",
            created_by="system",
            created_from="auto-provision"
        )
        db.add(guest_role)
        db.commit()
        db.refresh(guest_role)

    db.add(models.UserRole(
        user_id=new_user.user_id, 
        role_id=guest_role.role_id,
        created_by="system",
        created_from="auto-provision",
        token_expiry=datetime.utcnow() + timedelta(days=365) # Long lived system auto-provision
    ))
    db.commit()

    # Create a dynamic response so it matches the UserOut schema
    response_data = schemas.UserOut(
        user_id=new_user.user_id,
        username=new_user.username,
        full_name=new_user.full_name,
        email=new_user.email,
        role="Guest",
        created_at=new_user.created_at,
        updated_at=new_user.updated_at
    )
    return response_data


@router.post("/refresh", response_model=schemas.TokenResponse)
@limiter.limit("10/minute")
def refresh_token(request: Request, payload: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    Issue a new access token using a valid refresh token.
    Uses token rotation (issues a new refresh token as well).
    """
    # 1. Verify the refresh token signature and type
    token_data = verify_refresh_token(payload.refresh_token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    email = token_data.get("sub")
    
    # 2. Check if the token exists and is active in our DB
    db_token = db.query(models.UserToken).filter(
        models.UserToken.refresh_token == payload.refresh_token,
        models.UserToken.is_active == True
    ).first()
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or inactive",
        )
    
    if db_token.refresh_token_expiry <= datetime.utcnow():
        db_token.is_active = False
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )
    
    # 3. Get User and roles
    user = db_token.user
    user_roles = [ur.role.role_name for ur in user.user_roles if ur.role]
    primary_role = user_roles[0] if user_roles else "Guest"
    
    # Flatten permissions
    permissions = []
    for ur in user.user_roles:
        if ur.role and ur.role.permissions:
            permissions.extend(ur.role.permissions)
    permissions = list(set(permissions))

    # 4. Generate NEW access and refresh tokens (Rotation)
    access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={
            "sub": user.email,
            "email": user.email,
            "role": primary_role,
            "user_id": user.user_id,
            "username": user.username,
            "full_name": user.full_name
        },
        expires_delta=access_expires,
    )
    
    refresh_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    # 5. UPDATE the existing row (No duplicates!)
    now = datetime.utcnow()
    db_token.token = new_access_token
    db_token.refresh_token = new_refresh_token
    db_token.expiry_date = now + access_expires
    db_token.refresh_token_expiry = now + refresh_expires
    db_token.updated_at = now
    db_token.token_expiry = now + access_expires # Keep audit field in sync
    
    db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "Bearer",
        "role": primary_role,
        "user_id": user.user_id,
        "username": user.username,
        "full_name": user.full_name,
        "permissions": permissions,
        "created_at": db_token.created_at,
        "updated_at": db_token.updated_at,
    }


@router.post("/logout", response_model=schemas.LogoutResponse)
def logout(
    current_user: models.User = Depends(get_current_user), 
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Logout endpoint. Deactivates the token in the database.
    """
    db_token = db.query(models.UserToken).filter(models.UserToken.token == token).first()
    if db_token:
        db_token.is_active = False
        db_token.updated_by = current_user.email
        db_token.updated_at = datetime.utcnow()
        db.commit()

    return {"message": f"User '{current_user.email}' logged out successfully"}

from pydantic import BaseModel
from jose import jwt, JWTError
import os

class VerifyTokenRequest(BaseModel):
    token: str

@router.post("/verify")
def verify_token(payload: VerifyTokenRequest, db: Session = Depends(get_db)):
    """
    Verify a JWT token from another module.
    Returns the decoded payload if valid.
    """
    try:
        # Avoid circular imports, read secret directly or use from auth
        JWT_SECRET = os.environ.get("JWT_SECRET")
        decoded_payload = jwt.decode(payload.token, JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        
        # Optionally verify against DB to ensure token wasn't revoked
        db_token = db.query(models.UserToken).filter(
            models.UserToken.token == payload.token,
            models.UserToken.is_active == True
        ).first()
        
        if not db_token:
            raise HTTPException(status_code=401, detail="Token revoked or inactive")

        return {
            "valid": True,
            "payload": decoded_payload
        }
    except JWTError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Return the currently authenticated user's profile and roles.
    Used by Frontend AuthGate to verify session on page renders.
    """
    roles = [ur.role.role_name for ur in current_user.user_roles if ur.role]
    primary_role = roles[0] if roles else "Guest"
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": primary_role,
        "roles": roles
    }
