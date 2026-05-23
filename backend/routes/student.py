from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from auth import get_current_student
from database import get_db
import models

router = APIRouter(prefix="/api", tags=["student"])


class LegacyLoginRequest(schemas.BaseModel):
    username: str
    password: str


@router.post("/signup", response_model=schemas.StudentOut, status_code=201)
def signup(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = (
        db.query(models.Student)
        .filter(models.Student.username == student.username)
        .first()
    )
    if db_student:
        raise HTTPException(status_code=400, detail="Username already registered")

    from auth import get_password_hash, create_access_token

    new_student = models.Student(
        name=student.name,
        email=student.email,
        phone=student.phone,
        username=student.username,
        password_hash=get_password_hash(student.password),
    )
    db.add(new_student)

    # Auto-provision into new users table
    existing_user = (
        db.query(models.User).filter(models.User.username == student.username).first()
    )
    if not existing_user:
        new_user = models.User(
            username=student.username,
            full_name=student.name,
            email=student.email,
            password_hash=get_password_hash(student.password),
            created_by="system",
            created_from="signup",
        )
        db.add(new_user)
        db.flush()

        student_role = (
            db.query(models.Role).filter(models.Role.role_name == "Student").first()
        )
        if not student_role:
            student_role = models.Role(
                role_name="Student", created_by="system", created_from="signup"
            )
            db.add(student_role)
            db.flush()

        from datetime import datetime, timedelta

        db.add(
            models.UserRole(
                user_id=new_user.user_id,
                role_id=student_role.role_id,
                created_by="system",
                created_from="signup",
                token_expiry=datetime.utcnow() + timedelta(days=365),
            )
        )

    db.commit()
    db.refresh(new_student)

    access_token = create_access_token({"sub": new_student.username})
    return {"access_token": access_token, **new_student.__dict__}


@router.post("/login")
def login(payload: LegacyLoginRequest, db: Session = Depends(get_db)):
    db_student = (
        db.query(models.Student)
        .filter(models.Student.username == payload.username)
        .first()
    )

    from auth import verify_password, create_access_token

    if not db_student or not verify_password(
        payload.password, db_student.password_hash
    ):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    access_token = create_access_token({"sub": db_student.username})
    return {"access_token": access_token, **db_student.__dict__}


@router.get("/me", response_model=schemas.StudentOut)
def get_me(current_student: models.Student = Depends(get_current_student)):
    return current_student


@router.get("/students", response_model=List[schemas.StudentOut])
def get_all_students(db: Session = Depends(get_db)):
    """Admin endpoint — returns all registered students."""
    return db.query(models.Student).all()
