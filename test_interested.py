import requests

r = requests.post("http://127.0.0.1:8000/api/interested-opportunities?opp_id=py-automation", headers={"Authorization": "Bearer TEST"})
print("Status Code:", r.status_code)
print("Response text:", r.text)
