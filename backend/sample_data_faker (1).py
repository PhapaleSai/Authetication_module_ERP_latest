import random
import bcrypt
import psycopg2
from faker import Faker

# ─── CONFIG ────────────────────────────────────────────────────────────────────
DB_CONFIG = {
    "dbname": "pvg_auth",
    "user": "postgres",
    "password": "sai123",
    "host": "localhost",
    "port": "5432",
}

fake = Faker("en_IN")
Faker.seed(42)
random.seed(42)

# ─── SEED DATA ─────────────────────────────────────────────────────────────────
MODULE_DATA = [
    ("Student Management", "Manage student profiles and records"),
    ("Academic Planning", "Manage timetables and academic calendar"),
    ("Examination", "Manage exams, marks and results"),
    ("Finance", "Fee management and payments"),
    ("Placement", "Placement and internship tracking"),
]

FEATURE_DATA = [
    # (feature_name, description, module_index 0-based)
    ("Student Profile", "View and edit student personal info", 0),
    ("Attendance", "Track and manage attendance", 0),
    ("Timetable", "View and edit class timetable", 1),
    ("Academic Calendar", "Manage academic events", 1),
    ("Exam Schedule", "Create and view exam schedule", 2),
    ("Results", "Publish and view results", 2),
    ("Fee Management", "Collect and track fees", 3),
    ("Payment History", "View payment records", 3),
    ("Job Board", "View and apply for jobs", 4),
    ("Internships", "Manage internship records", 4),
]

# (permission_name, action, feature_index 0-based)
PERMISSION_DATA = [
    ("view_student", "read", 0),
    ("edit_student", "update", 0),
    ("create_student", "create", 0),
    ("delete_student", "delete", 0),
    ("view_attendance", "read", 1),
    ("mark_attendance", "create", 1),
    ("view_timetable", "read", 2),
    ("edit_timetable", "update", 2),
    ("view_calendar", "read", 3),
    ("edit_calendar", "update", 3),
    ("view_exam", "read", 4),
    ("create_exam", "create", 4),
    ("view_results", "read", 5),
    ("publish_results", "create", 5),
    ("view_fee", "read", 6),
    ("collect_fee", "create", 6),
    ("view_payments", "read", 7),
    ("view_jobs", "read", 8),
    ("post_job", "create", 8),
    ("view_internships", "read", 9),
]

ROLE_DATA = [
    ("Principal", "Head of the institution"),
    ("Vice Principal", "Assistant head of the institution"),
    ("HOD", "Head of Department"),
    ("Teacher", "Faculty member"),
    ("Student", "Enrolled student"),
    ("Admin", "System administrator"),
    ("Accountant", "Finance department staff"),
    ("Guest", "Default role with minimum permissions"),
]

# Role -> list of permission_names it gets
ROLE_PERMISSIONS = {
    "Principal": [p[0] for p in PERMISSION_DATA],  # all
    "Vice Principal": [p[0] for p in PERMISSION_DATA],  # all
    "HOD": [p[0] for p in PERMISSION_DATA if p[1] != "delete"],
    "Teacher": [
        "view_student",
        "view_attendance",
        "mark_attendance",
        "view_timetable",
        "view_exam",
        "view_results",
    ],
    "Student": [
        "view_student",
        "view_attendance",
        "view_timetable",
        "view_exam",
        "view_results",
        "view_fee",
        "view_payments",
        "view_jobs",
        "view_internships",
    ],
    "Admin": [p[0] for p in PERMISSION_DATA],  # all
    "Accountant": ["view_fee", "collect_fee", "view_payments", "view_student"],
    "Guest": ["view_timetable", "view_calendar"],
}


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def run():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    print("Connected to pvg_auth ✓")

    # ── 1. MODULES ──────────────────────────────────────────────────────────────
    print("\n[1] Inserting modules...")
    module_ids = []
    for name, desc in MODULE_DATA:
        cur.execute(
            "INSERT INTO modules (module_name, description) VALUES (%s, %s) ON CONFLICT (module_name) DO NOTHING RETURNING module_id",
            (name, desc),
        )
        row = cur.fetchone()
        if row:
            module_ids.append(row[0])
        else:
            cur.execute("SELECT module_id FROM modules WHERE module_name = %s", (name,))
            module_ids.append(cur.fetchone()[0])
    print(f"    → {len(module_ids)} modules mapped")

    # ── 2. FEATURES ─────────────────────────────────────────────────────────────
    print("[2] Inserting features...")
    feature_ids = []
    for fname, fdesc, mod_idx in FEATURE_DATA:
        cur.execute(
            "INSERT INTO features (feature_name, description, module_id) VALUES (%s, %s, %s) ON CONFLICT (feature_name) DO NOTHING RETURNING feature_id",
            (fname, fdesc, module_ids[mod_idx]),
        )
        row = cur.fetchone()
        if row:
            feature_ids.append(row[0])
        else:
            cur.execute(
                "SELECT feature_id FROM features WHERE feature_name = %s", (fname,)
            )
            feature_ids.append(cur.fetchone()[0])
    print(f"    → {len(feature_ids)} features mapped")

    # ── 3. PERMISSIONS ──────────────────────────────────────────────────────────
    print("[3] Inserting permissions...")
    permission_map = {}  # permission_name -> permission_id
    for pname, action, feat_idx in PERMISSION_DATA:
        cur.execute(
            "INSERT INTO permissions (permission_name, action, feature_id) VALUES (%s, %s, %s) ON CONFLICT (permission_name, action) DO NOTHING RETURNING permission_id",
            (pname, action, feature_ids[feat_idx]),
        )
        row = cur.fetchone()
        if row:
            permission_map[pname] = row[0]
        else:
            cur.execute(
                "SELECT permission_id FROM permissions WHERE permission_name = %s AND action = %s",
                (pname, action),
            )
            permission_map[pname] = cur.fetchone()[0]
    print(f"    → {len(permission_map)} permissions mapped")

    # ── 4. ROLES ────────────────────────────────────────────────────────────────
    print("[4] Inserting roles...")
    role_map = {}  # role_name -> role_id
    for rname, rdesc in ROLE_DATA:
        cur.execute(
            "INSERT INTO roles (role_name, description) VALUES (%s, %s) ON CONFLICT (role_name) DO NOTHING RETURNING role_id",
            (rname, rdesc),
        )
        row = cur.fetchone()
        if row:
            role_map[rname] = row[0]
        else:
            cur.execute("SELECT role_id FROM roles WHERE role_name = %s", (rname,))
            role_map[rname] = cur.fetchone()[0]
    print(f"    → {len(role_map)} roles mapped")

    # ── 5. ROLE_PERMISSIONS ─────────────────────────────────────────────────────
    print("[5] Inserting role_permissions...")
    rp_count = 0
    for role_name, perm_names in ROLE_PERMISSIONS.items():
        rid = role_map[role_name]
        for pname in perm_names:
            pid = permission_map[pname]
            cur.execute(
                "INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s) ON CONFLICT (role_id, permission_id) DO NOTHING",
                (rid, pid),
            )
            rp_count += 1
    print(f"    → {rp_count} role-permission mappings processed")

    # ── 6. USERS ────────────────────────────────────────────────────────────────
    print("[6] Inserting/Updating 50 fake users...")
    default_password = hash_password("password123")
    user_ids = []
    seen_usernames = set()
    seen_emails = set()

    while len(user_ids) < 50:
        name = fake.name()
        base_user = name.lower().replace(" ", ".").replace("'", "")
        username = f"{base_user}{random.randint(10, 99)}"
        email = f"{username}@pvg.ac.in"

        if username in seen_usernames or email in seen_emails:
            continue

        seen_usernames.add(username)
        seen_emails.add(email)

        cur.execute(
            """INSERT INTO users (username, full_name, email, password_hash, status) 
               VALUES (%s, %s, %s, %s, %s) 
               ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name 
               RETURNING user_id""",
            (username, name, email, default_password, True),
        )
        user_ids.append(cur.fetchone()[0])

    print(f"    → {len(user_ids)} users inserted")

    # ── 7. USER_ROLES ───────────────────────────────────────────────────────────
    print("[7] Assigning roles to users...")
    role_names = list(role_map.keys())
    for uid in user_ids:
        # assign 1-2 random roles per user
        assigned = random.sample(role_names, k=random.randint(1, 2))
        for rname in assigned:
            cur.execute(
                "INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)",
                (uid, role_map[rname]),
            )
    print("    → user_roles assigned")

    # ── 8. REFRESH_TOKENS ───────────────────────────────────────────────────────
    print("[8] Inserting refresh tokens...")
    import secrets
    import datetime

    for uid in random.sample(user_ids, k=30):
        token = secrets.token_hex(64)
        expiry = datetime.datetime.now() + datetime.timedelta(days=7)
        revoked = random.choice([True, False])
        cur.execute(
            "INSERT INTO refresh_tokens (user_id, refresh_token, expiry_time, revoked) VALUES (%s, %s, %s, %s)",
            (uid, token, expiry, revoked),
        )
    print("    → 30 refresh tokens inserted")

    # ── 9. LOGIN_LOG ────────────────────────────────────────────────────────────
    print("[9] Inserting login logs...")
    statuses = ["success", "failure", "blocked"]
    for _ in range(100):
        uid = random.choice(user_ids)
        ip = fake.ipv4()
        device = random.choice(
            [
                "Chrome/Windows",
                "Firefox/Linux",
                "Safari/macOS",
                "Chrome/Android",
                "Safari/iOS",
            ]
        )
        status = random.choices(statuses, weights=[70, 20, 10])[0]
        login_time = fake.date_time_between(start_date="-30d", end_date="now")
        cur.execute(
            """INSERT INTO login_log (user_id, ip_address, device_info, status, login_time)
               VALUES (%s, %s, %s, %s, %s)""",
            (uid, ip, device, status, login_time),
        )
    print("    → 100 login log entries inserted")

    conn.commit()
    cur.close()
    conn.close()

    print("\n" + "=" * 50)
    print("✅  All data successfully inserted into pvg_auth!")
    print("    Default password for all users: password123")
    print("=" * 50)


if __name__ == "__main__":
    run()
