
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

# Login to get token
def get_token():
    resp = requests.post(f"{BASE_URL}/login", data={"username": "testuser_ai", "password": "password123"})
    return resp.json().get("access_token")

def test_ai_parse():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    description = "I need a student to help with building a React frontend for our new community garden project. It should take about 4 hours a week for the next month. Reward is 500 XP points. Location is the Student Hub."
    
    print(f"Testing AI Parse with description: '{description}'\n")
    
    resp = requests.post(
        f"{BASE_URL}/ai/parse-opportunity",
        headers=headers,
        json={"description": description}
    )
    
    if resp.status_code == 200:
        data = resp.json()
        print("AI Extraction Result:")
        print(json.dumps(data, indent=2))
        
        # Verify key fields
        assert "React" in data["skills"]
        assert data["bounty"] == 500
        assert data["type"] in ["Initiative", "Workshop", "Event"]
        print("\n✅ Test Passed: AI successfully extracted structured data!")
    else:
        print(f"❌ Test Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_ai_parse()
