import os
import sqlalchemy
from dotenv import load_dotenv

# Load env variables from backend/.env
backend_env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
load_dotenv(backend_env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local default if env file is not loaded
    DATABASE_URL = "postgresql+psycopg2://postgres:sai123@localhost:5432/pvg_auth"

print(f"Connecting to database: {DATABASE_URL}")
engine = sqlalchemy.create_engine(DATABASE_URL)
connection = engine.connect()

# Tables that MUST be kept for the Auth/RBAC module
AUTH_TABLES = {
    "modules",
    "features",
    "permissions",
    "roles",
    "role_permissions",
    "users",
    "user_roles",
    "user_tokens",
    "login_log",
    "students"
}

try:
    inspector = sqlalchemy.inspect(engine)
    existing_tables = inspector.get_table_names()
    print(f"Found existing tables: {existing_tables}")

    tables_to_drop = [table for table in existing_tables if table not in AUTH_TABLES]
    print(f"Tables to drop: {tables_to_drop}")

    if not tables_to_drop:
        print("No unnecessary tables found in database. Only Auth tables are present!")
    else:
        # Drop tables with CASCADE to handle foreign key dependencies
        for table in tables_to_drop:
            print(f"Dropping table '{table}' (CASCADE)...")
            connection.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS \"{table}\" CASCADE;"))
            # Commit the drop
            connection.execute(sqlalchemy.text("COMMIT;"))
        print("Drop operations completed successfully.")

    # Verify remaining tables
    inspector = sqlalchemy.inspect(engine)
    remaining_tables = inspector.get_table_names()
    print(f"Remaining tables in database: {remaining_tables}")

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    connection.close()
