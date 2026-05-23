import sqlite3

db_path = "d:/taking_my_code_out/backend/pvg_local.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT * FROM users LIMIT 5")
rows = cursor.fetchall()
print("--- USERS DATA ---")
for row in rows:
    print(row)

conn.close()
