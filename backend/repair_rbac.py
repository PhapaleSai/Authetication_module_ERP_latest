from database import SessionLocal
import models
from auth import get_password_hash


def repair():
    db = SessionLocal()
    try:
        print("Starting RBAC Repair...")

        # 1. Ensure Admin Role exists
        admin_role = (
            db.query(models.Role).filter(models.Role.role_name == "admin").first()
        )
        if not admin_role:
            print("Creating Admin role...")
            admin_role = models.Role(
                role_name="admin", description="Super Administrator"
            )
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

        # 2. Reset Admin User Password
        admin_user = (
            db.query(models.User).filter(models.User.username == "admin").first()
        )
        if admin_user:
            print(f"Resetting password for user: {admin_user.username}")
            admin_user.password_hash = get_password_hash("admin")
            db.commit()
        else:
            print("Admin user not found, creating 'admin' user...")
            admin_user = models.User(
                username="admin",
                email="admin@admin.com",
                password_hash=get_password_hash("admin"),
                full_name="System Administrator",
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            # Link user to role
            db.add(
                models.UserRole(user_id=admin_user.user_id, role_id=admin_role.role_id)
            )
            db.commit()

        # 3. Grant ALL Permissions to Admin Role
        all_perms = db.query(models.Permission).all()
        print(f"Assigning {len(all_perms)} permissions to 'admin' role...")

        # Clear existing to avoid duplicates if any
        db.query(models.RolePermission).filter(
            models.RolePermission.role_id == admin_role.role_id
        ).delete()

        for perm in all_perms:
            rp = models.RolePermission(
                role_id=admin_role.role_id, permission_id=perm.permission_id
            )
            db.add(rp)

        db.commit()
        print("Admin Role Permissions updated successfully.")

        # 4. Handle Student Role (Example basic access)
        student_role = (
            db.query(models.Role).filter(models.Role.role_name == "student").first()
        )
        if not student_role:
            student_role = models.Role(
                role_name="student", description="Standard Student Role"
            )
            db.add(student_role)
            db.commit()
            db.refresh(student_role)

        print("RBAC Repair Complete.")

    except Exception as e:
        print(f"Error during repair: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    repair()
