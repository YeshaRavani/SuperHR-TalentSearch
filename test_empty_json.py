import requests
r = requests.post("http://127.0.0.1:8000/api/interested-opportunities?opp_id=py-automation", data="{}", headers={"Content-Type": "application/json"})
print(r.status_code)
