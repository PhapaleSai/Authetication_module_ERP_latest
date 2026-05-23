import psycopg2

dsn = "postgresql://postgres:sai123@localhost:5432/pvg_auth"

try:
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    print("Checking for 'andrew'...")
    cursor.execute("SELECT id, username FROM students WHERE username = 'andrew'")
    print(f"Student: {cursor.fetchone()}")

    cursor.execute("SELECT user_id, username FROM users WHERE username = 'andrew'")
    print(f"User: {cursor.fetchone()}")

    conn.close()
except Exception as e:
    print(e)
