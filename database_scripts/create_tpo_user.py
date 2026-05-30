import sys
import os

# Append backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from database import SessionLocal
import models
from auth import get_password_hash

def create_tpo_user():
    db = SessionLocal()
    try:
        email = "tpo@pvg.edu"
        username = "tpo_user"
        full_name = "Training & Placement Officer"
        password = "password123"
        role_name = "placement_officer"
        
        print("--- Creating Training & Placement Officer (TPO) Test User ---")
        
        # 1. Ensure user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            print(f"Creating user: {email}")
            user = models.User(
                username=username,
                full_name=full_name,
                email=email,
                password_hash=get_password_hash(password),
                status=True
            )
            db.add(user)
            db.flush()
        else:
            print(f"User already exists: {email}")
            user.password_hash = get_password_hash(password)
            db.flush()
            
        # 2. Get/create the 'placement_officer' role
        role = db.query(models.Role).filter(models.Role.role_name == role_name).first()
        if not role:
            print(f"Creating missing role: {role_name}")
            role = models.Role(role_name=role_name, description="Manages placements and alumni relations")
            db.add(role)
            db.flush()
            
        # 3. Assign role to user
        user_role = db.query(models.UserRole).filter(
            models.UserRole.user_id == user.user_id,
            models.UserRole.role_id == role.role_id
        ).first()
        
        if not user_role:
            print(f"Assigning role {role.role_name} to user {email}")
            user_role = models.UserRole(user_id=user.user_id, role_id=role.role_id)
            db.add(user_role)
        else:
            print(f"Role {role.role_name} already assigned to user {email}")
            
        db.commit()
        print("--- Creation Complete ---")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_tpo_user()
