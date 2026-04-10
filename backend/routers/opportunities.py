from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth
import uuid

router = APIRouter()

@router.get("/opportunities", response_model=List[models.OpportunityResponse])
def get_opportunities(db: Session = Depends(database.get_db)):
    return db.query(orm_models.Opportunity).filter(orm_models.Opportunity.status != "removed").all()

@router.get("/opportunities/{id}", response_model=models.OpportunityResponse)
def get_opportunity(id: str, db: Session = Depends(database.get_db)):
    opp = db.query(orm_models.Opportunity).filter(
        orm_models.Opportunity.id == id,
        orm_models.Opportunity.status != "removed",
    ).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@router.post("/opportunities", response_model=models.OpportunityResponse)
def create_opportunity(opp: models.OpportunityCreate, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    # 1. Handle skills separately
    skill_names = opp.skills
    skill_objs = []
    for name in skill_names:
        skill = db.query(orm_models.Skill).filter(orm_models.Skill.name == name).first()
        if not skill:
            skill = orm_models.Skill(name=name)
            db.add(skill)
            db.flush() # Get ID
        skill_objs.append(skill)

    # 2. Extract and serialize list fields
    opp_data = opp.dict(exclude={'skills'})
    import json
    for field in ['expectations', 'responsibilities', 'benefits', 'prerequisites']:
        if field in opp_data and isinstance(opp_data[field], list):
            opp_data[field] = json.dumps(opp_data[field])

    # 3. Create opportunity object
    new_opp = orm_models.Opportunity(
        id=str(uuid.uuid4()),
        author_id=current_user.id,
        skills=skill_objs,
        **opp_data
    )
    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)
    return new_opp

@router.get("/my-posted-opportunities", response_model=List[models.OpportunityResponse])
def get_my_opportunities(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(orm_models.Opportunity).filter(
        orm_models.Opportunity.author_id == current_user.id,
        orm_models.Opportunity.status != "removed",
    ).all()


@router.delete("/opportunities/{id}")
def delete_opportunity(
    id: str,
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    opp = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if current_user.role != "admin" and current_user.id != opp.author_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    audit = orm_models.OpportunityRemovalAudit(
        id=str(uuid.uuid4()),
        opportunity_id=opp.id,
        title=opp.title,
        removed_by=current_user.id,
    )
    db.add(audit)
    db.delete(opp)
    db.commit()
    return {"message": "Opportunity removed"}
