def test_user_crud_flow(client):
    # 1. Signup (first user becomes admin)
    r = client.post(
        "/auth/signup",
        json={
            "name": "Admin",
            "email": "admin@example.com",
            "password": "password123",
            "lat": 10.0,
            "lon": 20.0,
            "channel": "email",
        },
    )
    assert r.status_code == 201
    
    # 2. Login to get token
    login_data = {"username": "admin@example.com", "password": "password123"}
    r_login = client.post("/auth/login", data=login_data)
    assert r_login.status_code == 200
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create another user as admin
    r_create = client.post(
        "/users",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "password": "password123",
            "lat": 10.0,
            "lon": 20.0,
            "channel": "email",
        },
        headers=headers
    )
    assert r_create.status_code == 201
    uid = r_create.json()["id"]

    # 4. List users
    r_list = client.get("/users", headers=headers)
    assert len(r_list.json()) == 2 # Admin + Alice

    # 5. Update user
    r_put = client.put(f"/users/{uid}", json={"name": "Bob"}, headers=headers)
    assert r_put.json()["name"] == "Bob"

    # 6. Delete user
    r_del = client.delete(f"/users/{uid}", headers=headers)
    assert r_del.status_code == 204
