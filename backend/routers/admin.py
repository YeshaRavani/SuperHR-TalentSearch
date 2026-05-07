import uuid
from collections import Counter
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth
from ..services import ai_logic

router = APIRouter()


def require_admin(current_user: orm_models.User) -> None:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")


def normalized_org(user: orm_models.User) -> str:
    return (user.organisation or "").strip()


def same_org_user_filter(current_user: orm_models.User):
    org = normalized_org(current_user)
    if not org:
        return orm_models.User.id == current_user.id
    return func.trim(orm_models.User.organisation) == org


def same_org_opportunity_filter(current_user: orm_models.User):
    org = normalized_org(current_user)
    if not org:
        return orm_models.Opportunity.author_id == current_user.id
    return orm_models.Opportunity.author.has(func.trim(orm_models.User.organisation) == org)


def same_org_engagement_filter(current_user: orm_models.User):
    org = normalized_org(current_user)
    if not org:
        return orm_models.UserOpportunity.user_id == current_user.id
    return orm_models.UserOpportunity.user.has(func.trim(orm_models.User.organisation) == org)


def ensure_same_org_user(target_user: orm_models.User, current_user: orm_models.User) -> None:
    org = normalized_org(current_user)
    if org:
        if (target_user.organisation or "").strip() != org:
            raise HTTPException(status_code=404, detail="User not found")
    elif target_user.id != current_user.id:
        raise HTTPException(status_code=404, detail="User not found")


def ensure_same_org_opportunity(opportunity: orm_models.Opportunity, current_user: orm_models.User) -> None:
    author = opportunity.author
    org = normalized_org(current_user)
    if org:
        if not author or (author.organisation or "").strip() != org:
            raise HTTPException(status_code=404, detail="Opportunity not found")
    elif opportunity.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="Opportunity not found")


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


def serialize_datetime(value):
    return value.isoformat() if value else None


def serialize_user_profile(user: orm_models.User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "organisation": user.organisation,
        "department_team": user.department_team,
        "profile_photo_url": user.profile_photo_url,
        "total_points": user.total_points or 0,
        "is_active": user.is_active,
        "created_at": serialize_datetime(user.created_at),
        "skills": [skill.name for skill in user.skills],
    }


def serialize_opportunity_summary(opportunity: orm_models.Opportunity) -> dict:
    return {
        "id": opportunity.id,
        "type": opportunity.type,
        "title": opportunity.title,
        "status": opportunity.status,
        "created_at": serialize_datetime(opportunity.created_at),
    }


def serialize_admin_opportunity_overview(opportunity: orm_models.Opportunity, status_counts: dict) -> dict:
    author = opportunity.author
    return {
        "id": opportunity.id,
        "type": opportunity.type,
        "title": opportunity.title,
        "short_description": opportunity.short_description,
        "full_description": opportunity.full_description,
        "image_url": opportunity.image_url,
        "schedule_time": opportunity.schedule_time,
        "location": opportunity.location,
        "points_reward": opportunity.points_reward,
        "time_required": opportunity.time_required,
        "expectations": opportunity.expectations,
        "responsibilities": opportunity.responsibilities,
        "benefits": opportunity.benefits,
        "prerequisites": opportunity.prerequisites,
        "skills": [skill.name for skill in opportunity.skills],
        "main_icon": opportunity.main_icon,
        "tag_icon": opportunity.tag_icon,
        "bg_gradient": opportunity.bg_gradient,
        "icon_color": opportunity.icon_color,
        "status": opportunity.status,
        "author_id": opportunity.author_id,
        "created_at": serialize_datetime(opportunity.created_at),
        "author": {
            "id": author.id,
            "full_name": author.full_name,
            "email": author.email,
            "role": author.role,
            "department_team": author.department_team,
        } if author else None,
        "engagement": {
            "applications": status_counts.get("applied", 0),
            "interests": status_counts.get("interested", 0),
            "enrolled": status_counts.get("enrolled", 0),
            "completed": status_counts.get("completed", 0),
            "total": sum(status_counts.values()),
        },
    }


def serialize_user_opportunity_summary(record: orm_models.UserOpportunity) -> dict:
    return {
        "id": record.id,
        "status": record.status,
        "created_at": serialize_datetime(record.created_at),
        "updated_at": serialize_datetime(record.updated_at),
        "opportunity": serialize_opportunity_summary(record.opportunity) if record.opportunity else None,
    }


def serialize_applicant_overview(record: orm_models.UserOpportunity) -> dict:
    user = record.user
    opportunity = record.opportunity
    
    match_score = 0
    if user and opportunity:
        match_score = ai_logic.score_opportunity_match(user, opportunity)

    return {
        "id": record.id,
        "opportunity_id": record.opportunity_id,
        "status": record.status,
        "match_score": match_score,
        "created_at": serialize_datetime(record.created_at),
        "updated_at": serialize_datetime(record.updated_at),
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "organisation": user.organisation,
            "department_team": user.department_team,
            "profile_photo_url": user.profile_photo_url,
            "total_points": user.total_points or 0,
            "skills": [skill.name for skill in user.skills],
        } if user else None,
    }


def serialize_invitation_summary(invitation: orm_models.Invitation, direction: str) -> dict:
    return {
        "id": invitation.id,
        "topic": invitation.topic,
        "status": invitation.status,
        "direction": direction,
        "created_at": serialize_datetime(invitation.created_at),
        "sender": invitation.sender.full_name if invitation.sender else None,
        "receiver": invitation.receiver.full_name if invitation.receiver else None,
    }


def build_activity(label: str, category: str, created_at, status: str = None) -> dict:
    return {
        "label": label,
        "category": category,
        "status": status,
        "created_at": serialize_datetime(created_at),
    }

@router.get("/admin/users", response_model=List[models.UserResponse])
def get_admin_users(db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    require_admin(current_user)
    return (
        db.query(orm_models.User)
        .filter(same_org_user_filter(current_user))
        .order_by(orm_models.User.created_at.desc())
        .all()
    )


@router.get("/admin/users/{id}/profile")
def get_admin_user_profile(id: str, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    require_admin(current_user)

    db_user = db.query(orm_models.User).filter(orm_models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    ensure_same_org_user(db_user, current_user)

    user_opportunities = (
        db.query(orm_models.UserOpportunity)
        .filter(
            orm_models.UserOpportunity.user_id == id,
            orm_models.UserOpportunity.opportunity.has(same_org_opportunity_filter(current_user)),
        )
        .order_by(orm_models.UserOpportunity.created_at.desc())
        .all()
    )
    posted_opportunities = (
        db.query(orm_models.Opportunity)
        .filter(orm_models.Opportunity.author_id == id)
        .order_by(orm_models.Opportunity.created_at.desc())
        .all()
    )
    sent_invitations = (
        db.query(orm_models.Invitation)
        .filter(
            orm_models.Invitation.sender_id == id,
            orm_models.Invitation.receiver.has(same_org_user_filter(current_user)),
        )
        .order_by(orm_models.Invitation.created_at.desc())
        .all()
    )
    received_invitations = (
        db.query(orm_models.Invitation)
        .filter(
            orm_models.Invitation.receiver_id == id,
            orm_models.Invitation.sender.has(same_org_user_filter(current_user)),
        )
        .order_by(orm_models.Invitation.created_at.desc())
        .all()
    )

    applied_items = sum(1 for record in user_opportunities if record.status == "applied")
    interested_items = sum(1 for record in user_opportunities if record.status == "interested")
    participated_items = sum(1 for record in user_opportunities if record.status in {"enrolled", "completed"})
    collaborations = len(sent_invitations) + len(received_invitations)

    activity = []
    for record in user_opportunities[:5]:
        title = record.opportunity.title if record.opportunity else "an opportunity"
        if record.status == "interested":
            label = f"Marked interest in {title}"
        elif record.status == "completed":
            label = f"Completed {title}"
        elif record.status == "enrolled":
            label = f"Joined {title}"
        else:
            label = f"Applied to {title}"
        activity.append(build_activity(label, "opportunity", record.updated_at or record.created_at, record.status))

    for opportunity in posted_opportunities[:5]:
        activity.append(build_activity(f"Posted {opportunity.title}", "posted", opportunity.created_at, opportunity.status))

    for invitation in sent_invitations[:3]:
        activity.append(build_activity(f"Sent collaboration invite for {invitation.topic}", "invitation", invitation.created_at, invitation.status))

    for invitation in received_invitations[:3]:
        activity.append(build_activity(f"Received collaboration invite for {invitation.topic}", "invitation", invitation.created_at, invitation.status))

    activity.sort(key=lambda item: item["created_at"] or "", reverse=True)

    return {
        "user": serialize_user_profile(db_user),
        "stats": {
            "applied_items": applied_items,
            "posted_items": len(posted_opportunities),
            "participated_items": participated_items,
            "interested_items": interested_items,
            "collaborations": collaborations,
        },
        "applications": [serialize_user_opportunity_summary(record) for record in user_opportunities],
        "posted_opportunities": [serialize_opportunity_summary(opportunity) for opportunity in posted_opportunities],
        "sent_invitations": [serialize_invitation_summary(invitation, "sent") for invitation in sent_invitations],
        "received_invitations": [serialize_invitation_summary(invitation, "received") for invitation in received_invitations],
        "recent_activity": activity[:8],
    }

@router.post("/admin/users", response_model=models.UserResponse)
def create_admin_user(user: models.UserCreate, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    require_admin(current_user)
    organisation = normalized_org(current_user) or user.organisation
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = orm_models.User(
        id=str(uuid.uuid4()),
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        organisation=organisation,
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
    ensure_same_org_user(db_user, current_user)
    
    for key, value in user_update.dict().items():
        setattr(db_user, key, value)
    if normalized_org(current_user):
        db_user.organisation = normalized_org(current_user)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/admin/users/{id}")
def delete_user(id: str, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    require_admin(current_user)
    
    db_user = db.query(orm_models.User).filter(orm_models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    ensure_same_org_user(db_user, current_user)
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

@router.get("/opportunities/{id}/applicants", response_model=List[models.UserOpportunityResponse])
def get_opportunity_applicants(id: str, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    opp = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    if current_user.role == "admin":
        ensure_same_org_opportunity(opp, current_user)
    
    if current_user.id != opp.author_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(orm_models.UserOpportunity).filter(orm_models.UserOpportunity.opportunity_id == id)
    if current_user.role == "admin":
        query = query.filter(same_org_engagement_filter(current_user))
    return query.all()


@router.get("/opportunities/{id}/applicants/overview")
def get_opportunity_applicant_overview(id: str, db: Session = Depends(database.get_db), current_user: orm_models.User = Depends(auth.get_current_user)):
    opp = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    if current_user.role == "admin":
        ensure_same_org_opportunity(opp, current_user)

    if current_user.id != opp.author_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    records = (
        db.query(orm_models.UserOpportunity)
        .filter(
            orm_models.UserOpportunity.opportunity_id == id,
            orm_models.UserOpportunity.user_id.isnot(None),
            same_org_engagement_filter(current_user) if current_user.role == "admin" else True,
        )
        .order_by(orm_models.UserOpportunity.created_at.desc())
        .all()
    )
    counts = Counter(record.status for record in records)

    return {
        "opportunity_id": id,
        "counts": {
            "interested": counts.get("interested", 0),
            "applied": counts.get("applied", 0),
            "enrolled": counts.get("enrolled", 0),
            "completed": counts.get("completed", 0),
            "rejected": counts.get("rejected", 0),
            "total": len(records),
        },
        "applicants": [serialize_applicant_overview(record) for record in records],
    }


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
    return (
        db.query(orm_models.Opportunity)
        .filter(same_org_opportunity_filter(current_user))
        .order_by(orm_models.Opportunity.created_at.desc())
        .all()
    )


@router.get("/admin/opportunities/overview")
def get_admin_opportunities_overview(
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    require_admin(current_user)

    opportunities = (
        db.query(orm_models.Opportunity)
        .filter(same_org_opportunity_filter(current_user))
        .order_by(orm_models.Opportunity.created_at.desc())
        .all()
    )
    opportunity_ids = [opportunity.id for opportunity in opportunities]
    engagement_rows = (
        db.query(
            orm_models.UserOpportunity.opportunity_id,
            orm_models.UserOpportunity.status,
            func.count(orm_models.UserOpportunity.id),
        )
        .filter(
            orm_models.UserOpportunity.opportunity_id.in_(opportunity_ids) if opportunity_ids else False,
            same_org_engagement_filter(current_user),
        )
        .group_by(orm_models.UserOpportunity.opportunity_id, orm_models.UserOpportunity.status)
        .all()
    )

    counts_by_opportunity = {}
    for opportunity_id, status, count in engagement_rows:
        counts_by_opportunity.setdefault(opportunity_id, {})[status] = count

    return [
        serialize_admin_opportunity_overview(
            opportunity,
            counts_by_opportunity.get(opportunity.id, {}),
        )
        for opportunity in opportunities
    ]


@router.get("/admin/dashboard", response_model=models.AdminDashboardStatsResponse)
def get_admin_dashboard(
    db: Session = Depends(database.get_db),
    current_user: orm_models.User = Depends(auth.get_current_user),
):
    require_admin(current_user)

    users = db.query(orm_models.User).filter(same_org_user_filter(current_user)).all()
    opportunities = db.query(orm_models.Opportunity).filter(same_org_opportunity_filter(current_user)).all()
    opportunity_ids = [opportunity.id for opportunity in opportunities]
    user_opportunities = (
        db.query(orm_models.UserOpportunity)
        .filter(
            orm_models.UserOpportunity.opportunity_id.in_(opportunity_ids) if opportunity_ids else False,
            same_org_engagement_filter(current_user),
        )
        .all()
    )
    removed_opportunity_count = (
        db.query(func.count(orm_models.OpportunityRemovalAudit.id))
        .filter(
            orm_models.OpportunityRemovalAudit.removed_by.in_([user.id for user in users]) if users else False
        )
        .scalar()
        or 0
    )
    user_skill_counts = db.query(orm_models.Skill.name, func.count(orm_models.UserSkill.user_id)).join(
        orm_models.UserSkill, orm_models.UserSkill.skill_id == orm_models.Skill.id
    ).join(
        orm_models.User, orm_models.User.id == orm_models.UserSkill.user_id
    ).filter(
        same_org_user_filter(current_user)
    ).group_by(orm_models.Skill.id).order_by(func.count(orm_models.UserSkill.user_id).desc()).limit(6).all()
    opportunity_skill_counts = db.query(orm_models.Skill.name, func.count(orm_models.OpportunitySkill.opportunity_id)).join(
        orm_models.OpportunitySkill, orm_models.OpportunitySkill.skill_id == orm_models.Skill.id
    ).join(
        orm_models.Opportunity, orm_models.Opportunity.id == orm_models.OpportunitySkill.opportunity_id
    ).filter(
        same_org_opportunity_filter(current_user)
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
