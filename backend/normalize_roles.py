from database import SessionLocal
import models


def normalize():
    db = SessionLocal()
    try:
        print("Normalizing Roles...")

        # Merge duplicates
        role_pairs = [
            ("Admin", "admin"),
            ("Student", "student"),
            ("Principal", "principal"),
            ("Vice Principal", "vice_principal"),
            ("HOD", "hod"),
            ("Guest", "guest"),
        ]

        for old_name, new_name in role_pairs:
            old_role = (
                db.query(models.Role).filter(models.Role.role_name == old_name).first()
            )
            new_role = (
                db.query(models.Role).filter(models.Role.role_name == new_name).first()
            )

            if old_role and new_role and old_role.role_id != new_role.role_id:
                print(
                    f"Merging {old_name} (ID {old_role.role_id}) into {new_name} (ID {new_role.role_id})..."
                )

                # Update UserRoles
                user_roles = (
                    db.query(models.UserRole)
                    .filter(models.UserRole.role_id == old_role.role_id)
                    .all()
                )
                for ur in user_roles:
                    ur.role_id = new_role.role_id

                # Update RolePermissions (merge safely)
                old_perms = (
                    db.query(models.RolePermission)
                    .filter(models.RolePermission.role_id == old_role.role_id)
                    .all()
                )
                new_perm_ids = [
                    rp.permission_id
                    for rp in db.query(models.RolePermission)
                    .filter(models.RolePermission.role_id == new_role.role_id)
                    .all()
                ]

                for rp in old_perms:
                    if rp.permission_id not in new_perm_ids:
                        rp.role_id = new_role.role_id
                    else:
                        db.delete(rp)  # Duplicate permission link

                db.delete(old_role)
                db.commit()
                print(f"Successfully merged {old_name}.")
            elif old_role and not new_role:
                print(f"Renaming {old_name} to {new_name}...")
                old_role.role_name = new_name
                db.commit()

        print("Normalization Complete.")

    except Exception as e:
        print(f"Error during normalization: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    normalize()
