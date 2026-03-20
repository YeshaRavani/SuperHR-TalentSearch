import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, orm_models, database
from ..utils import auth

router = APIRouter()

@router.get("/ai/match", response_model=List[models.OpportunityResponse])
def get_ai_matches(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Simple keyword-based matching for now as a "credible" AI endpoint
    skills = (current_user.department_team or "").split(",")
    all_opps = db.query(orm_models.Opportunity).all()
    
    matches = []
    for opp in all_opps:
        for skill in skills:
            if skill.lower().strip() in opp.expectations.lower() or skill.lower().strip() in opp.title.lower():
                matches.append(opp)
                break
    
    return matches[:5]

@router.get("/ai/suggestions")
def get_ai_suggestions(current_user: orm_models.User = Depends(auth.get_current_user)):
    return ["Update your profile with more skills for better matching.", "Check out the new Python automation workshop."]
