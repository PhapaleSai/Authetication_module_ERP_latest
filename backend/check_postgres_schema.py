import psycopg2

dsn = "postgresql://postgres:sai123@localhost:5432/pvg_auth"

try:
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    tables = ["students", "users"]
    for table in tables:
        print(f"\nTable: {table}")
        cursor.execute(
            f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='{table}'"
        )
        cols = cursor.fetchall()
        for col in cols:
            print(f"  {col[0]} ({col[1]}) - {col[2]}")

    conn.close()
except Exception as e:
    print(e)
