import sqlite3
import os

db_path = "d:/taking_my_code_out/backend/pvg_local.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add email column to students table
        cursor.execute("ALTER TABLE students ADD COLUMN email VARCHAR(150)")
        print("Successfully added 'email' column to 'students' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'email' already exists in 'students' table.")
        else:
            print(f"Error adding column: {e}")

    conn.commit()
    conn.close()
