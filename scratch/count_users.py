import sys
import os
sys.path.append(os.path.abspath('.'))
from backend.database import SessionLocal
from backend.orm_models import User

db = SessionLocal()
try:
    count = db.query(User).count()
    print("Total users:", count)
except Exception as e:
    print("Error:", e)
