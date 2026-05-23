import psycopg2

dsn = "postgresql://postgres:sai123@localhost:5432/pvg_auth"

try:
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    # Try the failing SELECT
    sql = """
    SELECT students.id AS students_id, students.name AS students_name, students.email AS students_email, 
           students.phone AS students_phone, students.username AS students_username, 
           students.password_hash AS students_password_hash, students.created_at AS students_created_at 
    FROM students 
    WHERE students.username = 'andrew' 
    LIMIT 1
    """
    cursor.execute(sql)
    print("SELECT successful!")

    conn.close()
except Exception as e:
    print(f"SELECT failed: {e}")
