from backend.utils import auth
from backend.database import SessionLocal
from backend.orm_models import User
import requests

token = auth.create_access_token(data={"sub": "rushil"})
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 1. Test POST with empty body
r = requests.post("http://127.0.0.1:8000/api/interested-opportunities?opp_id=py-automation", headers=headers, data="{}")
print("With {}:", r.status_code, r.text)

# 2. Test POST with NO body
r2 = requests.post("http://127.0.0.1:8000/api/interested-opportunities?opp_id=py-automation", headers=headers)
print("No body:", r2.status_code, r2.text)
