import psycopg2
import pprint

conn = psycopg2.connect("postgresql://postgres:sai123@localhost:5432/pvg_auth")
cur = conn.cursor()
cur.execute(
    "SELECT user_id, username, email FROM users WHERE username='abhishek' OR email='abhishek'"
)
pprint.pprint(cur.fetchall())
