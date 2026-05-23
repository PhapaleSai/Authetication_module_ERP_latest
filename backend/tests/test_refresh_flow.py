import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
import models
from auth import get_password_hash

# Basic test setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Create test user
    user = models.User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        password_hash=get_password_hash("testpass"),
    )
    db.add(user)
    db.commit()

    yield db

    db.close()
    Base.metadata.drop_all(bind=engine)


def test_refresh_token_flow(setup_db):
    # 1. Login to get initial tokens
    response = client.post(
        "/api/auth/login", data={"username": "test@example.com", "password": "testpass"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

    initial_access = data["access_token"]
    initial_refresh = data["refresh_token"]

    # 2. Use refresh token to get a new pair
    refresh_response = client.post(
        "/api/auth/refresh", json={"refresh_token": initial_refresh}
    )
    assert refresh_response.status_code == 200
    new_data = refresh_response.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data

    new_access = new_data["access_token"]
    new_refresh = new_data["refresh_token"]

    assert new_access != initial_access
    assert new_refresh != initial_refresh

    # 3. Old refresh token should now be invalid (rotated)
    old_refresh_response = client.post(
        "/api/auth/refresh", json={"refresh_token": initial_refresh}
    )
    assert old_refresh_response.status_code == 401
