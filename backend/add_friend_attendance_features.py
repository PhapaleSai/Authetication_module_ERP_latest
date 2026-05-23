from database import SessionLocal
import models


def main():
    db = SessionLocal()
    try:
        # Get module
        module_name = "Attendance System"
        db_module = (
            db.query(models.Module)
            .filter(models.Module.module_name == module_name)
            .first()
        )
        if not db_module:
            db_module = models.Module(module_name=module_name)
            db.add(db_module)
            db.commit()
            db.refresh(db_module)

        # Ensure Roles
        student_role = (
            db.query(models.Role).filter(models.Role.role_name == "student").first()
        )
        faculty_role = (
            db.query(models.Role).filter(models.Role.role_name == "faculty").first()
        )

        features_to_add = {
            "Student Login Authentication": {"student": ["read"], "faculty": []},
            "View Daily Attendance Records": {"student": ["read"], "faculty": []},
            "Check Attendance Percentage": {"student": ["read"], "faculty": []},
            "Receive Attendance Notifications": {"student": ["read"], "faculty": []},
            "View Monthly Attendance Reports": {"student": ["read"], "faculty": []},
            "Teacher Secure Login": {
                "student": [],
                "faculty": ["create", "read", "update", "delete"],
            },
            "Mark Student Attendance": {
                "student": [],
                "faculty": ["create", "read", "update", "delete"],
            },
            "Update/Edit Attendance Records": {
                "student": [],
                "faculty": ["create", "read", "update", "delete"],
            },
            "View Class Attendance Reports": {
                "student": [],
                "faculty": ["create", "read", "update", "delete"],
            },
            "Generate Attendance Percentage": {
                "student": [],
                "faculty": ["create", "read", "update", "delete"],
            },
            "Search and Filter Student Records": {
                "student": [],
                "faculty": ["create", "read", "update", "delete"],
            },
            "Export Attendance Reports": {
                "student": [],
                "faculty": ["create", "read", "update", "delete"],
            },
        }

        for f_name, role_perms in features_to_add.items():
            db_feature = (
                db.query(models.Feature)
                .filter(
                    models.Feature.feature_name == f_name,
                    models.Feature.module_id == db_module.module_id,
                )
                .first()
            )
            if not db_feature:
                db_feature = models.Feature(
                    feature_name=f_name, module_id=db_module.module_id
                )
                db.add(db_feature)
                db.commit()
                db.refresh(db_feature)

            # Create standard permissions
            perms = {}
            for action_str in ["create", "read", "update", "delete"]:
                perm_name = f"{f_name}:{action_str}"
                perm = (
                    db.query(models.Permission)
                    .filter(
                        models.Permission.feature_id == db_feature.feature_id,
                        models.Permission.action == action_str,
                    )
                    .first()
                )
                if not perm:
                    perm = models.Permission(
                        permission_name=perm_name,
                        action=action_str,
                        feature_id=db_feature.feature_id,
                    )
                    db.add(perm)
                    db.commit()
                    db.refresh(perm)
                perms[action_str] = perm

            # Assign to student
            if student_role:
                for action in role_perms["student"]:
                    perm = perms[action]
                    rp = (
                        db.query(models.RolePermission)
                        .filter(
                            models.RolePermission.role_id == student_role.role_id,
                            models.RolePermission.permission_id == perm.permission_id,
                        )
                        .first()
                    )
                    if not rp:
                        print(f"Granting '{action}' on '{f_name}' to 'student'")
                        rp = models.RolePermission(
                            role_id=student_role.role_id,
                            permission_id=perm.permission_id,
                        )
                        db.add(rp)

            # Assign to faculty
            if faculty_role:
                for action in role_perms["faculty"]:
                    perm = perms[action]
                    rp = (
                        db.query(models.RolePermission)
                        .filter(
                            models.RolePermission.role_id == faculty_role.role_id,
                            models.RolePermission.permission_id == perm.permission_id,
                        )
                        .first()
                    )
                    if not rp:
                        print(f"Granting '{action}' on '{f_name}' to 'faculty'")
                        rp = models.RolePermission(
                            role_id=faculty_role.role_id,
                            permission_id=perm.permission_id,
                        )
                        db.add(rp)

        db.commit()
        print("Successfully added new features and permissions.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
