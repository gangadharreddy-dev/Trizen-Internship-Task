import io
import pytest
from app.models.user import UserRole

# Helper to register and obtain auth token
def create_user_and_token(client, email: str, role: UserRole = UserRole.TEAM_MEMBER, name: str = "Test User"):
    res = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": "Password123!", "role": role.value}
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    user_id = res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    return user_id, headers

# 1. Admin Registration
def test_admin_registration(client):
    res = client.post(
        "/api/auth/register",
        json={"name": "Lead Admin", "email": "superadmin@example.com", "password": "SecretPassword123!", "role": "ADMIN"}
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "superadmin@example.com"
    assert data["user"]["role"] == "ADMIN"

# 2. Login
def test_login(client):
    # Register first
    client.post(
        "/api/auth/register",
        json={"name": "Photographer", "email": "photo@example.com", "password": "MySecretPassword123!", "role": "TEAM_MEMBER"}
    )
    # Login with valid credentials
    res = client.post(
        "/api/auth/login",
        json={"email": "photo@example.com", "password": "MySecretPassword123!"}
    )
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["user"]["email"] == "photo@example.com"

# 3. Authentication (Invalid or missing token)
def test_authentication(client):
    # Missing token
    res = client.get("/api/auth/me")
    assert res.status_code == 401

    # Malformed / fake token
    res2 = client.get("/api/auth/me", headers={"Authorization": "Bearer fake.invalid.token"})
    assert res2.status_code == 401

# 4. Role Authorization (Team member cannot create events or publish galleries)
def test_role_authorization(client):
    _, member_headers = create_user_and_token(client, "member1@example.com", UserRole.TEAM_MEMBER)

    # Team member attempting to create an event -> 403 Forbidden
    res = client.post(
        "/api/events",
        json={"name": "Unauthorized Event"},
        headers=member_headers
    )
    assert res.status_code == 403
    assert "Admin privileges required" in res.json()["detail"]

# 5. Team Member Event Access (Assigned team member can access their assigned event)
def test_team_member_event_access(client):
    _, admin_headers = create_user_and_token(client, "admin1@example.com", UserRole.ADMIN)
    member_id, member_headers = create_user_and_token(client, "member2@example.com", UserRole.TEAM_MEMBER)

    # Admin creates event
    ev_res = client.post(
        "/api/events",
        json={"name": "Golden Jubilee"},
        headers=admin_headers
    )
    assert ev_res.status_code == 201
    event_id = ev_res.json()["id"]

    # Admin assigns member to event
    assign_res = client.post(
        f"/api/events/{event_id}/members",
        json={"user_id": member_id},
        headers=admin_headers
    )
    assert assign_res.status_code == 201

    # Team member accesses assigned event
    access_res = client.get(f"/api/events/{event_id}", headers=member_headers)
    assert access_res.status_code == 200
    assert access_res.json()["name"] == "Golden Jubilee"

# 6. Unauthorized Event Access (Unassigned team member cannot access event)
def test_unauthorized_event_access(client):
    _, admin_headers = create_user_and_token(client, "admin2@example.com", UserRole.ADMIN)
    _, unassigned_headers = create_user_and_token(client, "unassigned@example.com", UserRole.TEAM_MEMBER)

    # Admin creates event
    ev_res = client.post(
        "/api/events",
        json={"name": "Private Gala"},
        headers=admin_headers
    )
    event_id = ev_res.json()["id"]

    # Unassigned member tries to access
    access_res = client.get(f"/api/events/{event_id}", headers=unassigned_headers)
    assert access_res.status_code == 403
    assert "not assigned" in access_res.json()["detail"].lower()

# 7. Photo Upload Authorization
def test_photo_upload_authorization(client):
    _, admin_headers = create_user_and_token(client, "admin3@example.com", UserRole.ADMIN)
    member_id, member_headers = create_user_and_token(client, "assigned_uploader@example.com", UserRole.TEAM_MEMBER)
    _, outsider_headers = create_user_and_token(client, "outsider@example.com", UserRole.TEAM_MEMBER)

    # Create event and assign member
    ev_res = client.post("/api/events", json={"name": "Fashion Week"}, headers=admin_headers)
    event_id = ev_res.json()["id"]
    client.post(f"/api/events/{event_id}/members", json={"user_id": member_id}, headers=admin_headers)

    fake_image = io.BytesIO(b"fake image binary content data")
    files = [("files", ("model_shot1.jpg", fake_image, "image/jpeg"))]

    # Assigned member upload succeeds
    up_res = client.post(f"/api/events/{event_id}/photos", files=files, headers=member_headers)
    assert up_res.status_code == 201
    assert len(up_res.json()["uploaded"]) == 1

    # Outsider upload rejected with 403
    fake_image2 = io.BytesIO(b"fake image binary content data 2")
    files2 = [("files", ("model_shot2.jpg", fake_image2, "image/jpeg"))]
    rejected_res = client.post(f"/api/events/{event_id}/photos", files=files2, headers=outsider_headers)
    assert rejected_res.status_code == 403

# 8. Gallery Publishing
def test_gallery_publishing(client):
    _, admin_headers = create_user_and_token(client, "admin4@example.com", UserRole.ADMIN)
    ev_res = client.post("/api/events", json={"name": "Annual Awards"}, headers=admin_headers)
    event_id = ev_res.json()["id"]

    # Upload and select a photo
    fake_image = io.BytesIO(b"image bytes")
    files = [("files", ("award.jpg", fake_image, "image/jpeg"))]
    upload_res = client.post(f"/api/events/{event_id}/photos", files=files, headers=admin_headers)
    photo_id = upload_res.json()["uploaded"][0]["id"]

    # Select photo
    client.put(
        f"/api/events/{event_id}/photos/selection",
        json={"photo_ids": [photo_id], "is_selected": True},
        headers=admin_headers
    )

    # Create gallery with PIN
    gal_res = client.post(
        f"/api/events/{event_id}/gallery",
        json={"pin": "543210"},
        headers=admin_headers
    )
    assert gal_res.status_code == 200
    gallery_id = gal_res.json()["id"]
    public_token = gal_res.json()["public_token"]

    # Publish gallery
    pub_res = client.post(
        f"/api/galleries/{gallery_id}/publish",
        json={"published": True},
        headers=admin_headers
    )
    assert pub_res.status_code == 200
    assert pub_res.json()["published"] is True
    assert pub_res.json()["photo_count"] == 1
    assert pub_res.json()["public_token"] == public_token

# 9. Incorrect Gallery PIN
def test_incorrect_gallery_pin(client):
    _, admin_headers = create_user_and_token(client, "admin5@example.com", UserRole.ADMIN)
    ev_res = client.post("/api/events", json={"name": "Baby Shower"}, headers=admin_headers)
    event_id = ev_res.json()["id"]

    # Create & publish gallery
    gal_res = client.post(f"/api/events/{event_id}/gallery", json={"pin": "998877"}, headers=admin_headers)
    gallery_id = gal_res.json()["id"]
    public_token = gal_res.json()["public_token"]
    client.post(f"/api/galleries/{gallery_id}/publish", json={"published": True}, headers=admin_headers)

    # Customer enters WRONG pin
    verify_res = client.post(
        f"/api/gallery/{public_token}/verify",
        json={"pin": "000000"}
    )
    assert verify_res.status_code == 401
    assert "Incorrect PIN" in verify_res.json()["detail"]

# 10. Correct Gallery PIN
def test_correct_gallery_pin(client):
    _, admin_headers = create_user_and_token(client, "admin6@example.com", UserRole.ADMIN)
    ev_res = client.post("/api/events", json={"name": "Corporate Summit"}, headers=admin_headers)
    event_id = ev_res.json()["id"]

    # Create & publish gallery
    gal_res = client.post(f"/api/events/{event_id}/gallery", json={"pin": "123456"}, headers=admin_headers)
    gallery_id = gal_res.json()["id"]
    public_token = gal_res.json()["public_token"]
    client.post(f"/api/galleries/{gallery_id}/publish", json={"published": True}, headers=admin_headers)

    # Customer enters CORRECT pin
    verify_res = client.post(
        f"/api/gallery/{public_token}/verify",
        json={"pin": "123456"}
    )
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert data["success"] is True
    assert "session_token" in data
    assert data["gallery"]["public_token"] == public_token

# 11. Customer Access to Published Photos
def test_customer_access_to_published_photos(client):
    _, admin_headers = create_user_and_token(client, "admin7@example.com", UserRole.ADMIN)
    ev_res = client.post("/api/events", json={"name": "Graduation Day"}, headers=admin_headers)
    event_id = ev_res.json()["id"]

    # Upload 2 photos
    fake_img1 = io.BytesIO(b"photo1 bytes")
    files = [("files", ("cap_toss.jpg", fake_img1, "image/jpeg"))]
    upload_res = client.post(f"/api/events/{event_id}/photos", files=files, headers=admin_headers)
    photo_id = upload_res.json()["uploaded"][0]["id"]

    # Select photo 1
    client.put(
        f"/api/events/{event_id}/photos/selection",
        json={"photo_ids": [photo_id], "is_selected": True},
        headers=admin_headers
    )

    # Create & publish gallery
    gal_res = client.post(f"/api/events/{event_id}/gallery", json={"pin": "445566"}, headers=admin_headers)
    gallery_id = gal_res.json()["id"]
    public_token = gal_res.json()["public_token"]
    client.post(f"/api/galleries/{gallery_id}/publish", json={"published": True}, headers=admin_headers)

    # Verify PIN
    verify_res = client.post(f"/api/gallery/{public_token}/verify", json={"pin": "445566"})
    session_token = verify_res.json()["session_token"]

    # Customer fetches photos with session token
    photos_res = client.get(
        f"/api/gallery/{public_token}/photos",
        headers={"X-Gallery-Token": session_token}
    )
    assert photos_res.status_code == 200
    photos = photos_res.json()
    assert len(photos) == 1
    assert photos[0]["id"] == photo_id
    assert photos[0]["filename"] == "cap_toss.jpg"

# 12. Customer Inability to Access Unpublished Photos
def test_customer_inability_to_access_unpublished_photos(client):
    _, admin_headers = create_user_and_token(client, "admin8@example.com", UserRole.ADMIN)
    ev_res = client.post("/api/events", json={"name": "Secret Party"}, headers=admin_headers)
    event_id = ev_res.json()["id"]

    # Create gallery (published=False by default)
    gal_res = client.post(f"/api/events/{event_id}/gallery", json={"pin": "778899"}, headers=admin_headers)
    public_token = gal_res.json()["public_token"]

    # Customer tries to verify PIN on UNPUBLISHED gallery -> 404
    verify_res = client.post(f"/api/gallery/{public_token}/verify", json={"pin": "778899"})
    assert verify_res.status_code == 404

    # Customer attempts to fetch photos directly without valid session token -> 401
    photos_res = client.get(f"/api/gallery/{public_token}/photos")
    assert photos_res.status_code == 401
