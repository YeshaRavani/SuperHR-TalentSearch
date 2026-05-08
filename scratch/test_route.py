import sys
import os
sys.path.append(os.path.abspath('.'))
from backend.database import SessionLocal
from backend.orm_models import Opportunity
from backend.models import OpportunityResponse

db = SessionLocal()
try:
    opps = db.query(Opportunity).filter(Opportunity.status != "removed").all()
    print("Found opportunities:", len(opps))
    res = []
    for o in opps:
        try:
            res.append(OpportunityResponse.model_validate(o))
        except Exception as e:
            print(f"Error validating opp {o.id}: {e}")
            import traceback
            traceback.print_exc()
            break
except Exception as e:
    import traceback
    traceback.print_exc()
