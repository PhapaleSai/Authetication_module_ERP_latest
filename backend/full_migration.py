import sqlite3

db_path = "d:/taking_my_code_out/backend/pvg_local.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Starting migration...")

    # 1. Backup users table
    cursor.execute("ALTER TABLE users RENAME TO users_old")

    # 2. Create new users table with correct schema (matching models.py)
    # user_id, username, full_name, email, password_hash, status, created_at, updated_at, ...
    cursor.execute("""
        CREATE TABLE users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(150),
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            status BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(150),
            updated_by VARCHAR(150),
            created_from VARCHAR(100),
            token_expiry DATETIME
        )
    """)

    # 3. Copy data from users_old to users
    # users_old: user_id, name, email, password_hash, role, role_id
    cursor.execute("SELECT user_id, name, email, password_hash FROM users_old")
    old_users = cursor.fetchall()

    for u in old_users:
        uid, name, email, pw_hash = u
        # Generate a username from email or name if missing
        username = email.split("@")[0] if email else name.lower().replace(" ", "_")

        try:
            cursor.execute(
                """
                INSERT INTO users (user_id, username, full_name, email, password_hash, created_by, created_from)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (uid, username, name, email, pw_hash, "migration", "legacy_sync"),
            )
        except sqlite3.IntegrityError:
            # Handle duplicate usernames if any
            username = f"{username}_{uid}"
            cursor.execute(
                """
                INSERT INTO users (user_id, username, full_name, email, password_hash, created_by, created_from)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (uid, username, name, email, pw_hash, "migration", "legacy_sync"),
            )

    # 4. Handle roles (Check if roles table exists and has correct columns)
    # The dump showed: role_id, role_name
    # Models.py Role: role_id, role_name, description + Audit fields

    # Check roles columns
    cursor.execute("PRAGMA table_info(roles)")
    roles_cols = [c[1] for c in cursor.fetchall()]
    if "created_at" not in roles_cols:
        print("Migrating roles table...")
        cursor.execute("ALTER TABLE roles RENAME TO roles_old")
        cursor.execute("""
            CREATE TABLE roles (
                role_id INTEGER PRIMARY KEY AUTOINCREMENT,
                role_name VARCHAR(100) UNIQUE NOT NULL,
                description VARCHAR,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(150),
                updated_by VARCHAR(150),
                created_from VARCHAR(100),
                token_expiry DATETIME
            )
        """)
        cursor.execute(
            "INSERT INTO roles (role_id, role_name) SELECT role_id, role_name FROM roles_old"
        )
        cursor.execute("DROP TABLE roles_old")

    # 5. Create missing relationship tables (user_roles, user_tokens, etc.)
    # These will be created by the app's create_all on next start,
    # but we should migrate existing role associations if any.

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_roles (
            user_role_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(user_id),
            role_id INTEGER REFERENCES roles(role_id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(150),
            updated_by VARCHAR(150),
            created_from VARCHAR(100),
            token_expiry DATETIME
        )
    """)

    # Migrate role_id from users_old to user_roles
    cursor.execute("SELECT user_id, role_id FROM users_old WHERE role_id IS NOT NULL")
    associations = cursor.fetchall()
    for assoc in associations:
        uid, rid = assoc
        cursor.execute(
            "INSERT INTO user_roles (user_id, role_id, created_from) VALUES (?, ?, ?)",
            (uid, rid, "migration"),
        )

    # 6. Cleanup
    cursor.execute("DROP TABLE users_old")

    print("Migration completed successfully!")
    conn.commit()

except Exception as e:
    print(f"Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()
