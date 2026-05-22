import pandas as pd
from database import SessionLocal
import models

def normalize_role_name(name):
    if pd.isna(name): return None
    mapping = {
        'Applicant': 'applicant',
        'Principal': 'principal',
        'Vice Principal': 'vice_principal',
        'HOD': 'hod',
        'Faculty': 'faculty',
        'Students': 'student',
        'Accountant': 'accountant',
        'Exam Controller': 'exam_controller',
        'Placement Cell': 'placement_cell',
        'Admin': 'admin',
        'IT Admin': 'it_admin'
    }
    return mapping.get(name, str(name).strip().lower().replace(' ', '_'))

def main():
    db = SessionLocal()
    try:
        df = pd.read_excel('D:/taking_my_code_out/ERP_Module_Submodule_Role_Permissions.xlsx')
        
        # 1. Sync Roles
        role_columns = ['Applicant', 'Principal', 'Vice Principal', 'HOD', 'Faculty', 'Students', 'Accountant', 'Exam Controller', 'Placement Cell', 'Admin', 'IT Admin']
        
        roles_cache = {}
        for col in role_columns:
            norm_name = normalize_role_name(col)
            role = db.query(models.Role).filter(models.Role.role_name == norm_name).first()
            if not role:
                print(f"Creating missing role: {norm_name}")
                role = models.Role(role_name=norm_name, description=f"Role imported from Excel: {col}")
                db.add(role)
                db.commit()
                db.refresh(role)
            roles_cache[col] = role

        # 2. Iterate Rows
        current_module = None
        for index, row in df.iterrows():
            module_val = row.get('Module')
            if pd.notna(module_val):
                current_module = str(module_val).strip()
            
            feature_val = row.get('Feature / Submodule')
            if pd.isna(feature_val):
                continue
            feature_name = str(feature_val).strip()
            
            # Find or Create Module
            db_module = None
            if current_module:
                db_module = db.query(models.Module).filter(models.Module.module_name == current_module).first()
                if not db_module:
                    print(f"Creating Module: {current_module}")
                    db_module = models.Module(module_name=current_module)
                    db.add(db_module)
                    db.commit()
                    db.refresh(db_module)
            
            # Find or Create Feature
            module_id = db_module.module_id if db_module else None
            db_feature = db.query(models.Feature).filter(models.Feature.feature_name == feature_name, models.Feature.module_id == module_id).first()
            if not db_feature:
                print(f"Creating Feature: {feature_name} under Module {current_module}")
                desc = str(row.get('Scope Explanation', ''))
                if desc == 'nan': desc = ''
                db_feature = models.Feature(feature_name=feature_name, module_id=module_id, description=desc)
                db.add(db_feature)
                db.commit()
                db.refresh(db_feature)
            
            # Ensure 4 baseline permissions exist for this feature
            action_map = {'C': 'create', 'R': 'read', 'U': 'update', 'D': 'delete'}
            perms_cache = {}
            for letter, action_str in action_map.items():
                perm_name = f"{feature_name}:{action_str}"
                perm = db.query(models.Permission).filter(
                    models.Permission.feature_id == db_feature.feature_id,
                    models.Permission.action == action_str
                ).first()
                if not perm:
                    perm = models.Permission(
                        permission_name=perm_name,
                        action=action_str,
                        feature_id=db_feature.feature_id
                    )
                    db.add(perm)
                    db.commit()
                    db.refresh(perm)
                perms_cache[letter] = perm
            
            # Assign Permissions to Roles safely (appending)
            for col in role_columns:
                cell_val = row.get(col)
                if pd.notna(cell_val):
                    actions = str(cell_val).upper()
                    role = roles_cache[col]
                    
                    for letter in actions:
                        if letter in perms_cache:
                            perm = perms_cache[letter]
                            
                            # Check if RolePermission already exists
                            rp = db.query(models.RolePermission).filter(
                                models.RolePermission.role_id == role.role_id,
                                models.RolePermission.permission_id == perm.permission_id
                            ).first()
                            
                            if not rp:
                                print(f"Granting {action_map[letter]} on '{feature_name}' to role '{role.role_name}'")
                                rp = models.RolePermission(
                                    role_id=role.role_id,
                                    permission_id=perm.permission_id
                                )
                                db.add(rp)
        
        db.commit()
        print("Import completed successfully!")
    
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    main()
