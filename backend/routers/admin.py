import uuid
from collections import Counter
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth

router = APIRouter()


def require_admin(current_user: orm_models.User) -> None:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")


def get_or_create_reward_policy(db: Session) -> orm_models.RewardPolicy:
    policy = db.query(orm_models.RewardPolicy).first()
    if not policy:
        policy = orm_models.RewardPolicy(active_mode="points", hours_per_leave=8)
        db.add(policy)
        db.commit()
        db.refresh(policy)
    return policy


def get_or_create_admin_settings(db: Session) -> orm_models.AdminSetting:
    settings = db.query(orm_models.AdminSetting).first()
    if not settings:
        settings = orm_models.AdminSetting()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("/admin/users", response_model=List[models.UserResponse])
def get_admin_users(db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    require_admin(current_user)
    return db.query(orm_models.User).all()

@router.post("/admin/users", response_model=models.UserResponse)
def create_admin_user(user: models.UserCreate, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    require_admin(current_user)
    
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
    require_admin(current_user)
    
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
    require_admin(current_user)
    
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
    return get_or_create_reward_policy(db)

@router.put("/admin/reward-policy", response_model=models.RewardPolicyResponse)
def update_reward_policy(policy_update: models.RewardPolicyBase, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    require_admin(current_user)

    policy = get_or_create_reward_policy(db)
    policy.active_mode = policy_update.active_mode
    policy.hours_per_leave = policy_update.hours_per_leave
    policy.updated_at = datetime.now()
    
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/admin/system-settings", response_model=models.AdminSystemSettingsResponse)
def get_admin_system_settings(
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    require_admin(current_user)
    return get_or_create_admin_settings(db)


@router.put("/admin/system-settings", response_model=models.AdminSystemSettingsResponse)
def update_admin_system_settings(
    settings_update: models.AdminSystemSettingsBase,
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    require_admin(current_user)
    settings = get_or_create_admin_settings(db)

    settings.maintenance_mode = settings_update.maintenance_mode
    settings.auto_approve_opportunities = settings_update.auto_approve_opportunities
    settings.allow_public_profiles = settings_update.allow_public_profiles
    settings.require_2fa_for_admins = settings_update.require_2fa_for_admins
    settings.session_timeout_minutes = settings_update.session_timeout_minutes
    settings.updated_at = datetime.now()

    db.commit()
    db.refresh(settings)
    return settings


@router.get("/admin/opportunities", response_model=List[models.OpportunityResponse])
def get_admin_opportunities(
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    require_admin(current_user)
    return db.query(orm_models.Opportunity).order_by(orm_models.Opportunity.created_at.desc()).all()


@router.get("/admin/dashboard", response_model=models.AdminDashboardStatsResponse)
def get_admin_dashboard(
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    require_admin(current_user)

    users = db.query(orm_models.User).all()
    opportunities = db.query(orm_models.Opportunity).all()
    user_opportunities = db.query(orm_models.UserOpportunity).all()
    removed_opportunity_count = db.query(func.count(orm_models.OpportunityRemovalAudit.id)).scalar() or 0
    user_skill_counts = db.query(orm_models.Skill.name, func.count(orm_models.UserSkill.user_id)).join(
        orm_models.UserSkill, orm_models.UserSkill.skill_id == orm_models.Skill.id
    ).group_by(orm_models.Skill.id).order_by(func.count(orm_models.UserSkill.user_id).desc()).limit(6).all()
    opportunity_skill_counts = db.query(orm_models.Skill.name, func.count(orm_models.OpportunitySkill.opportunity_id)).join(
        orm_models.OpportunitySkill, orm_models.OpportunitySkill.skill_id == orm_models.Skill.id
    ).group_by(orm_models.Skill.id).order_by(func.count(orm_models.OpportunitySkill.opportunity_id).desc()).limit(6).all()

    total_users = len(users)
    active_opportunities = sum(1 for opp in opportunities if opp.status != "removed")
    removed_opportunities = removed_opportunity_count
    total_applications = sum(1 for record in user_opportunities if record.status == "applied")
    total_interests = sum(1 for record in user_opportunities if record.status == "interested")
    active_users = sum(1 for user in users if user.is_active)
    system_health = round((active_users / total_users) * 100, 1) if total_users else 100.0

    now = datetime.utcnow()
    growth_windows = []
    for weeks_ago in range(3, -1, -1):
        window_start = now - timedelta(days=(weeks_ago + 1) * 7)
        window_end = now - timedelta(days=weeks_ago * 7)
        count = sum(
            1 for user in users
            if user.created_at and window_start <= user.created_at < window_end
        )
        growth_windows.append(models.AdminMetricPoint(label=f"Week {4 - weeks_ago}", value=count))

    dept_counter = Counter(
        (user.department_team or "Unassigned")
        for user in users
    )

    skill_counts = user_skill_counts if user_skill_counts else opportunity_skill_counts

    return models.AdminDashboardStatsResponse(
        total_users=total_users,
        active_opportunities=active_opportunities,
        removed_opportunities=removed_opportunities,
        total_applications=total_applications,
        total_interests=total_interests,
        system_health=system_health,
        user_growth=growth_windows,
        top_skills=[models.AdminMetricPoint(label=name, value=count) for name, count in skill_counts],
        department_activity=[
            models.AdminMetricPoint(label=label, value=value)
            for label, value in dept_counter.most_common(5)
        ],
    )
