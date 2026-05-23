from database import SessionLocal
from models import Role, RolePermission


def generate_report():
    db = SessionLocal()
    try:
        roles = db.query(Role).all()
        with open("D:/taking_my_code_out/role_permissions_report.txt", "w") as f:
            for role in sorted(roles, key=lambda x: x.role_name):
                f.write(f"=== Role: {role.role_name} ===\n")
                role_perms = (
                    db.query(RolePermission)
                    .filter(RolePermission.role_id == role.role_id)
                    .all()
                )
                if not role_perms:
                    f.write("  (No permissions assigned)\n")
                else:
                    perms_by_feature = {}
                    for rp in role_perms:
                        perm = rp.permission
                        if perm:
                            feature_name = (
                                perm.feature.feature_name if perm.feature else "Unknown"
                            )
                            if feature_name not in perms_by_feature:
                                perms_by_feature[feature_name] = []
                            perms_by_feature[feature_name].append(perm.action)

                    for feature, actions in sorted(perms_by_feature.items()):
                        f.write(f"  - {feature}: {', '.join(sorted(actions))}\n")
                f.write("\n")
        print("Report generated successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    generate_report()
