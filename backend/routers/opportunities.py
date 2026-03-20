from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth
import uuid

router = APIRouter()

@router.get("/opportunities", response_model=List[models.OpportunityResponse])
def get_opportunities(db: Session = Depends(database.get_db)):
    return db.query(orm_models.Opportunity).all()

@router.get("/opportunities/{id}", response_model=models.OpportunityResponse)
def get_opportunity(id: str, db: Session = Depends(database.get_db)):
    opp = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@router.post("/opportunities", response_model=models.OpportunityResponse)
def create_opportunity(opp: models.OpportunityCreate, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    new_opp = orm_models.Opportunity(
        id=str(uuid.uuid4()),
        author_id=current_user.id,
        **opp.dict()
    )
    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)
    return new_opp

@router.get("/my-posted-opportunities", response_model=List[models.OpportunityResponse])
def get_my_opportunities(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(orm_models.Opportunity).filter(orm_models.Opportunity.author_id == current_user.id).all()
