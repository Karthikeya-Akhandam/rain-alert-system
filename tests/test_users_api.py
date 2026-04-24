def test_user_crud_flow(client):
    r = client.post(
        "/users",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "lat": 10.0,
            "lon": 20.0,
            "channel": "email",
        },
    )
    assert r.status_code == 201
    uid = r.json()["id"]
    r2 = client.get("/users")
    assert len(r2.json()) == 1
    r3 = client.put(f"/users/{uid}", json={"name": "Bob"})
    assert r3.json()["name"] == "Bob"
    r4 = client.delete(f"/users/{uid}")
    assert r4.status_code == 204
