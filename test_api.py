import requests

def test():
    # Login as user-1
    r = requests.post("http://127.0.0.1:8000/api/login", data={"username": "rushil", "password": "user123"})
    if r.status_code != 200:
        print("Login failed:", r.text)
        return
    
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Try adding interest
    r2 = requests.post("http://127.0.0.1:8000/api/interested-opportunities?opp_id=py-automation", headers=headers)
    print("Post Interest Response:", r2.status_code, r2.text)

test()
