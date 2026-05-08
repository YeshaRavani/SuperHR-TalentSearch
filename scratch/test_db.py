import sys
import os
sys.path.append(os.path.abspath('.'))
from backend.database import SessionLocal
from backend.orm_models import Opportunity

db = SessionLocal()
try:
    opps = db.query(Opportunity).all()
    print("Found opportunities:", len(opps))
    for o in opps[:1]:
        print(o.__dict__)
except Exception as e:
    import traceback
    traceback.print_exc()
