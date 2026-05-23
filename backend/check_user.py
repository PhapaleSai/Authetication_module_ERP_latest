import sqlite3

db_path = "d:/taking_my_code_out/backend/pvg_local.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- STUDENTS TABLE ---")
cursor.execute(
    "SELECT id, name, username, email FROM students WHERE username = 'shivam'"
)
student = cursor.fetchone()
if student:
    print(
        f"ID: {student[0]}, Name: {student[1]}, Username: {student[2]}, Email: {student[3]}"
    )
else:
    print("User 'shivam' not found in students table.")

print("\n--- USERS TABLE ---")
cursor.execute(
    "SELECT user_id, username, full_name, email FROM users WHERE username = 'shivam'"
)
user = cursor.fetchone()
if user:
    print(
        f"User ID: {user[0]}, Username: {user[1]}, Full Name: {user[2]}, Email: {user[3]}"
    )
else:
    print("User 'shivam' not found in users table.")

conn.close()
