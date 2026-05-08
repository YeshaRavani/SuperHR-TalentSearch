import sys
import os
sys.path.append(os.path.abspath('.'))
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

res = client.get("/api/opportunities")
if res.status_code != 200:
    print(f"Failed /api/opportunities: {res.status_code}")
    print(res.text)
else:
    print("Success /api/opportunities")

res = client.get("/api/posted-opportunities")
if res.status_code != 200:
    print(f"Failed /api/posted-opportunities: {res.status_code}")
    print(res.text)
else:
    print("Success /api/posted-opportunities")

