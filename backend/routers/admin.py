import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth

router = APIRouter()

@router.get("/admin/users", response_model=List[models.UserResponse])
def get_admin_users(db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(orm_models.User).all()

@router.post("/admin/users", response_model=models.UserResponse)
def create_admin_user(user: models.UserCreate, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = orm_models.User(
        id=str(uuid.uuid4()),
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        organisation=user.organisation,
        department_team=user.department_team
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/admin/users/{id}", response_model=models.UserResponse)
def update_user(id: str, user_update: models.UserBase, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_user = db.query(orm_models.User).filter(orm_models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_update.dict().items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/admin/users/{id}")
def delete_user(id: str, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_user = db.query(orm_models.User).filter(orm_models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

@router.get("/opportunities/{id}/applicants", response_model=List[models.UserOpportunityResponse])
def get_opportunity_applicants(id: str, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    opp = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    if current_user.id != opp.author_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(orm_models.UserOpportunity).filter(orm_models.UserOpportunity.opportunity_id == id).all()


@router.get("/admin/reward-policy", response_model=models.RewardPolicyResponse)
def get_reward_policy(db: Session = Depends(database.get_db)):
    policy = db.query(orm_models.RewardPolicy).first()
    if not policy:
        # Create a default one if not exists
        policy = orm_models.RewardPolicy(active_mode="points", hours_per_leave=8)
        db.add(policy)
        db.commit()
        db.refresh(policy)
    return policy

@router.put("/admin/reward-policy", response_model=models.RewardPolicyResponse)
def update_reward_policy(policy_update: models.RewardPolicyBase, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    policy = db.query(orm_models.RewardPolicy).first()
    if not policy:
        policy = orm_models.RewardPolicy()
        db.add(policy)
    
    policy.active_mode = policy_update.active_mode
    policy.hours_per_leave = policy_update.hours_per_leave
    policy.updated_at = datetime.now()
    
    db.commit()
    db.refresh(policy)
    return policy
