import sys
import os

# Append backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from database import SessionLocal
import models
from auth import get_password_hash

def create_test_users():
    db = SessionLocal()
    try:
        # Define roles and users
        test_accounts = [
            {
                "role_name": "Parent",
                "email": "parent@pvg.edu",
                "username": "parent_user",
                "full_name": "Parent User"
            },
            {
                "role_name": "Employer",
                "email": "employer@pvg.edu",
                "username": "employer_user",
                "full_name": "Employer User"
            },
            {
                "role_name": "Alumni",
                "email": "alumni@pvg.edu",
                "username": "alumni_user",
                "full_name": "Alumni User"
            }
        ]

        print("--- Setting up Parent, Employer, and Alumni Test Accounts ---")

        for acc in test_accounts:
            role_name = acc["role_name"]
            
            # 1. Ensure Role exists (case-insensitive find, insert exact casing)
            role = db.query(models.Role).filter(models.Role.role_name.ilike(role_name)).first()
            if not role:
                print(f"Creating role: {role_name}")
                role = models.Role(
                    role_name=role_name, 
                    description=f"Role for {role_name} users"
                )
                db.add(role)
                db.flush()  # to get role_id
            else:
                print(f"Role already exists: {role.role_name}")
                
            # 2. Ensure User exists
            email = acc["email"]
            username = acc["username"]
            full_name = acc["full_name"]
            password = "password123"
            
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
                print(f"User already exists: {user.email}")
                # Reset password to password123 to ensure it works
                user.password_hash = get_password_hash(password)
                db.flush()
                
            # 3. Assign Role to User
            user_role = db.query(models.UserRole).filter(
                models.UserRole.user_id == user.user_id,
                models.UserRole.role_id == role.role_id
            ).first()
            
            if not user_role:
                print(f"Assigning role {role.role_name} to user {user.email}")
                user_role = models.UserRole(user_id=user.user_id, role_id=role.role_id)
                db.add(user_role)
            else:
                print(f"Role {role.role_name} is already assigned to user {user.email}")
                
        db.commit()
        print("--- Test Accounts Setup Successfully ---")
        
    except Exception as e:
        print(f"Error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
