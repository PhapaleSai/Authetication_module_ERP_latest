from database import SessionLocal
import models
from auth import get_password_hash


def create_sis_data():
    db = SessionLocal()
    try:
        # Define roles and users
        sis_roles = [
            "Students",
            "IT Admins",
            "Principals & Vice Principals",
            "HODs",
            "Teaching Staff",
            "Non-Teaching Staff",
            "Accountants",
        ]

        print("--- Integrating SIS Module Roles and Users ---")

        for role_name in sis_roles:
            # 1. Ensure Role exists
            role = (
                db.query(models.Role).filter(models.Role.role_name == role_name).first()
            )
            if not role:
                print(f"Creating role: {role_name}")
                role = models.Role(
                    role_name=role_name, description=f"Role for {role_name} integration"
                )
                db.add(role)
                db.flush()  # To get the role_id
            else:
                print(f"Role already exists: {role_name}")

            # 2. Ensure User exists
            username = role_name
            password = role_name
            # Generate a simple email based on role name
            email_slug = role_name.lower().replace(" ", "_").replace("&", "and")
            email = f"{email_slug}@pvg.edu"

            user = (
                db.query(models.User).filter(models.User.username == username).first()
            )
            if not user:
                print(f"Creating user: {username}")
                user = models.User(
                    username=username,
                    full_name=role_name,
                    email=email,
                    password_hash=get_password_hash(password),
                    status=True,
                )
                db.add(user)
                db.flush()
            else:
                print(f"User already exists: {username}")

            # 3. Assign Role to User if not already assigned
            user_role = (
                db.query(models.UserRole)
                .filter(
                    models.UserRole.user_id == user.user_id,
                    models.UserRole.role_id == role.role_id,
                )
                .first()
            )

            if not user_role:
                print(f"Assigning role {role_name} to user {username}")
                user_role = models.UserRole(user_id=user.user_id, role_id=role.role_id)
                db.add(user_role)
            else:
                print(f"Role {role_name} already assigned to user {username}")

        db.commit()
        print("--- Integration Complete Successfully ---")

    except Exception as e:
        print(f"Error during integration: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_sis_data()
