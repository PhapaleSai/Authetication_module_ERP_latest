import sqlite3

db_path = "d:/taking_my_code_out/backend/pvg_local.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Detailed Schema Info ---")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print(f"\nTable: {table[0]}")
    cursor.execute(f"PRAGMA table_info({table[0]})")
    columns = cursor.fetchall()
    # columns[3] is notnull
    for col in columns:
        status = "NOT NULL" if col[3] else "NULL"
        pk = "PK" if col[5] else ""
        print(f"  {col[1]} ({col[2]}) {status} {pk}")

conn.close()
