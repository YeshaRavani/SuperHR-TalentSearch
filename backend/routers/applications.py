import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth

router = APIRouter()

@router.post("/interested-opportunities", response_model=models.UserOpportunityResponse)
def mark_interested(opp_id: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Check if already exists
    existing = db.query(orm_models.UserOpportunity).filter(
        orm_models.UserOpportunity.user_id == current_user.id,
        orm_models.UserOpportunity.opportunity_id == opp_id
    ).first()
    if existing:
        existing.status = "interested"
        db.commit()
        return existing
    
    new_interest = orm_models.UserOpportunity(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        opportunity_id=opp_id,
        status="interested"
    )
    db.add(new_interest)
    db.commit()
    db.refresh(new_interest)
    return new_interest


@router.get("/interested-opportunities", response_model=List[models.UserOpportunityResponse])
def get_interested_opportunities(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(orm_models.UserOpportunity).filter(
        orm_models.UserOpportunity.user_id == current_user.id,
        orm_models.UserOpportunity.status == "interested"
    ).all()

@router.delete("/interested-opportunities/{id}")
def remove_interest(id: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    interest = db.query(orm_models.UserOpportunity).filter(
        orm_models.UserOpportunity.opportunity_id == id,
        orm_models.UserOpportunity.user_id == current_user.id
    ).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")
    db.delete(interest)
    db.commit()
    return {"message": "Interest removed"}

@router.post("/applications", response_model=models.UserOpportunityResponse)
def apply_to_opportunity(opp_id: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    existing = db.query(orm_models.UserOpportunity).filter(
        orm_models.UserOpportunity.user_id == current_user.id,
        orm_models.UserOpportunity.opportunity_id == opp_id
    ).first()
    
    if existing:
        existing.status = "applied"
        existing.updated_at = datetime.now()
        db.commit()
        return existing
    
    new_app = orm_models.UserOpportunity(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        opportunity_id=opp_id,
        status="applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.get("/applications", response_model=List[models.UserOpportunityResponse])
def get_my_applications(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(orm_models.UserOpportunity).filter(
        orm_models.UserOpportunity.user_id == current_user.id,
        orm_models.UserOpportunity.status.in_(["applied", "enrolled", "rejected", "completed"])
    ).all()

@router.put("/applications/{id}", response_model=models.UserOpportunityResponse)
def update_application_status(id: str, status: str, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    # Role check (Only author or admin can update app status)
    app = db.query(orm_models.UserOpportunity).filter(orm_models.UserOpportunity.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    opp = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.id == app.opportunity_id).first()
    if current_user.id != opp.author_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    app.status = status
    app.updated_at = datetime.now()
    db.commit()
    db.refresh(app)
    return app


@router.post("/invitations", response_model=models.InvitationResponse)
def create_invitation(
    invitation: models.InvitationCreate,
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    receiver = db.query(orm_models.User).filter(orm_models.User.id == invitation.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    new_invitation = orm_models.Invitation(
        id=str(uuid.uuid4()),
        sender_id=current_user.id,
        receiver_id=invitation.receiver_id,
        topic=invitation.topic,
        message=invitation.message,
        status="pending",
    )
    db.add(new_invitation)
    db.commit()
    db.refresh(new_invitation)
    return new_invitation


@router.get("/invitations", response_model=List[models.InvitationResponse])
def get_invitations(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(orm_models.Invitation).filter(
        (orm_models.Invitation.sender_id == current_user.id) |
        (orm_models.Invitation.receiver_id == current_user.id)
    ).all()


@router.put("/invitations/{id}", response_model=models.InvitationResponse)
def update_invitation(
    id: str,
    invitation_update: models.InvitationUpdate,
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    invitation = db.query(orm_models.Invitation).filter(orm_models.Invitation.id == id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if current_user.id not in {invitation.sender_id, invitation.receiver_id} and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    invitation.status = invitation_update.status
    db.commit()
    db.refresh(invitation)
    return invitation
