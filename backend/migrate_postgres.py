import psycopg2

dsn = "postgresql://postgres:sai123@localhost:5432/pvg_auth"

try:
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    cursor = conn.cursor()
    print("Connected to PostgreSQL successfully.")

    # 1. Fix Students table
    try:
        # Check if email exists
        cursor.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name='students' AND column_name='email'"
        )
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE students ADD COLUMN email VARCHAR(150)")
            print("Added email to students.")

        # Add audit fields if missing
        audit_fields = [
            ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
            ("updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
            ("created_by", "VARCHAR(150)"),
            ("updated_by", "VARCHAR(150)"),
            ("created_from", "VARCHAR(100)"),
            ("token_expiry", "TIMESTAMP"),
        ]

        for field, ftype in audit_fields:
            cursor.execute(
                f"SELECT column_name FROM information_schema.columns WHERE table_name='students' AND column_name='{field}'"
            )
            if not cursor.fetchone():
                cursor.execute(f"ALTER TABLE students ADD COLUMN {field} {ftype}")
                print(f"Added {field} to students.")

        # Drop student_class if it exists (making it optional first to avoid errors)
        cursor.execute("ALTER TABLE students ALTER COLUMN student_class DROP NOT NULL")
        print("Made student_class optional in students.")

    except Exception as e:
        print(f"Error migrating students: {e}")

    # 2. Fix Users table
    try:
        # Add username to users
        cursor.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='username'"
        )
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE")
            # Fill usernames from email
            cursor.execute(
                "UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL"
            )
            # If username is still null (no email), use name
            cursor.execute(
                "UPDATE users SET username = lower(replace(name, ' ', '_')) WHERE username IS NULL"
            )
            print("Added and populated username in users.")

        # Add full_name if missing (rename name if exists)
        cursor.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='full_name'"
        )
        if not cursor.fetchone():
            cursor.execute(
                "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='name'"
            )
            if cursor.fetchone():
                cursor.execute("ALTER TABLE users RENAME COLUMN name TO full_name")
                print("Renamed name to full_name in users.")
            else:
                cursor.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR(150)")
                print("Added full_name to users.")

        # Add audit fields to users
        for field, ftype in audit_fields:
            cursor.execute(
                f"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='{field}'"
            )
            if not cursor.fetchone():
                cursor.execute(f"ALTER TABLE users ADD COLUMN {field} {ftype}")
                print(f"Added {field} to users.")

    except Exception as e:
        print(f"Error migrating users: {e}")

    conn.close()
    print("PostgreSQL migration finished.")

except Exception as e:
    print(f"Could not connect to PostgreSQL: {e}")
    print(
        "If you don't have Postgres running, please comment out the DATABASE_URL in backend/.env to use SQLite."
    )
