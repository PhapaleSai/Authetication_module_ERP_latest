import sqlite3

db_path = "d:/taking_my_code_out/backend/pvg_local.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Finalizing students table migration...")

    # 1. Check if student_class exists
    cursor.execute("PRAGMA table_info(students)")
    cols = {c[1]: c for c in cursor.fetchall()}

    if "student_class" in cols:
        print("Migrating students table...")
        cursor.execute("ALTER TABLE students RENAME TO students_old")

        # 2. Create new students table (matching latest models.py)
        cursor.execute("""
            CREATE TABLE students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                phone VARCHAR(15) NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(150),
                updated_by VARCHAR(150),
                created_from VARCHAR(100),
                token_expiry DATETIME
            )
        """)

        # 3. Copy data
        # students_old: id, name, student_class, phone, username, password_hash, email
        cursor.execute(
            "SELECT id, name, username, phone, password_hash, email FROM students_old"
        )
        rows = cursor.fetchall()
        for r in rows:
            sid, name, uname, phone, pw, email = r
            # Use dummy email if missing for legacy data
            final_email = email if email else f"{uname}@pvg.ac.in"

            cursor.execute(
                """
                INSERT INTO students (id, name, username, phone, password_hash, email, created_from)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (sid, name, uname, phone, pw, final_email, "migration"),
            )

        cursor.execute("DROP TABLE students_old")
        print("Students table migrated successfully!")

    conn.commit()

except Exception as e:
    print(f"Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()
