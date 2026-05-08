from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth
import uuid

router = APIRouter()

@router.get("/opportunities", response_model=List[models.OpportunityResponse])
def get_opportunities(
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_optional_current_user)
):
    query = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.status != "removed")
    
    # If logged in and not admin, hide own posts. 
    # If not logged in, show everything (public view).
    if current_user and current_user.role != "admin":
        query = query.filter(orm_models.Opportunity.author_id != current_user.id)
    
    opps = query.all()
    
    response_opps = []
    if current_user:
        from ..services.ai_logic import score_opportunity_match
        
    for opp in opps:
        # Get deterministic match data
        m_score = 0
        m_reasoning = ""
        if current_user:
            match_data = score_opportunity_match(current_user, opp, skip_ai=True)
            m_score = match_data["score"]
            m_reasoning = match_data.get("reasoning", "")
        
        # Explicitly create the response model
        opp_resp = models.OpportunityResponse(
            **models.OpportunityResponse.from_orm(opp).dict(exclude={"match_score", "match_reasoning"}),
            match_score=m_score,
            match_reasoning=m_reasoning
        )
        response_opps.append(opp_resp)
            
    return response_opps

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
    
    # 4. Create broadcast channel
    new_channel = orm_models.Channel(
        id=str(uuid.uuid4()),
        name=new_opp.title,
        description=f"Official channel for {new_opp.title}",
        opportunity_id=new_opp.id,
        is_broadcast=new_opp.is_broadcast, # Use the preference
        author_id=current_user.id
    )
    db.add(new_channel)
    
    db.commit()
    db.refresh(new_opp)
    return new_opp

@router.get("/my-posted-opportunities", response_model=List[models.OpportunityResponse])
def get_my_opportunities(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(orm_models.Opportunity).filter(
        orm_models.Opportunity.author_id == current_user.id,
        orm_models.Opportunity.status != "removed",
    ).all()


def ensure_admin_can_manage_opportunity(opportunity: orm_models.Opportunity, current_user: orm_models.User) -> None:
    if current_user.role != "admin":
        return

    admin_org = (current_user.organisation or "").strip()
    author_org = (opportunity.author.organisation or "").strip() if opportunity.author else ""
    if admin_org:
        if author_org != admin_org:
            raise HTTPException(status_code=404, detail="Opportunity not found")
    elif opportunity.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="Opportunity not found")


@router.delete("/opportunities/{id}")
def delete_opportunity(
    id: str,
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    opp = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    ensure_admin_can_manage_opportunity(opp, current_user)

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
