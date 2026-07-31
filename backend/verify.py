import time
import requests

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("Waiting for server to start...")
    time.sleep(3)

    # 1. Register a new user
    print("Testing /auth/register...")
    payload = {
        "name": "Test User",
        "email": "test@crm.com",
        "password": "testpassword",
        "role": "employee"
    }
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"Register Status: {r.status_code}")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # 2. Login as Admin
    print("Testing /auth/login (Admin)...")
    payload = {
        "email": "admin@crm.com",
        "password": "adminpassword"
    }
    r = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert r.status_code == 200, f"Failed: {r.text}"
    token = r.json()["access_token"]
    print("Login OK.")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Company
    print("Testing POST /companies...")
    comp_payload = {
        "name": "NewTech",
        "industry": "Software",
        "address": "Silicon Valley",
        "phone": "555-1234"
    }
    r = requests.post(f"{BASE_URL}/companies", json=comp_payload, headers=headers)
    assert r.status_code in [201, 400], f"Failed: {r.text}"
    print("Company OK.")

    # 4. Create Contact
    print("Testing POST /contacts...")
    cont_payload = {
        "company_id": 1,
        "name": "John Builder",
        "email": "john.builder@techcorp.com",
        "phone": "555-4321",
        "designation": "Manager"
    }
    r = requests.post(f"{BASE_URL}/contacts", json=cont_payload, headers=headers)
    assert r.status_code in [201, 400], f"Failed: {r.text}"
    print("Contact OK.")

    # 5. Create Assignment
    print("Testing POST /assignments (creating new assignment for Employee 1)...")
    assign_payload = {
        "user_id": 2, # employee1 seeded has ID 2
        "company_id": 1,
        "contact_id": None,
        "role": "Lead Engineer"
    }
    r = requests.post(f"{BASE_URL}/assignments", json=assign_payload, headers=headers)
    assert r.status_code == 201, f"Failed: {r.text}"
    print("Assignment OK.")

    # 6. Fetch notifications for user 2 (Employee 1)
    print("Logging in as Employee 1...")
    payload = {
        "email": "employee1@crm.com",
        "password": "employeepassword"
    }
    r = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert r.status_code == 200, f"Failed: {r.text}"
    emp_token = r.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    print("Fetching notifications...")
    r = requests.get(f"{BASE_URL}/notifications", headers=emp_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    notifications = r.json()
    assert len(notifications) > 0, "No notifications found for user!"
    print("Notifications count:", len(notifications))
    print("Latest notification message:", notifications[0]["message"])

    # 7. Mark notification as read
    notif_id = notifications[0]["id"]
    print(f"Marking notification ID {notif_id} as read...")
    r = requests.patch(f"{BASE_URL}/notifications/{notif_id}/read", headers=emp_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    assert r.json()["is_read"] is True
    print("Mark read OK.")

    print("All backend API integration tests completed successfully!")

if __name__ == "__main__":
    test_api()
