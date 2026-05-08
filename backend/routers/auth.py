from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from .. import database, orm_models, models
from ..utils import auth
import uuid

router = APIRouter()


def get_admin_organisations(db: Session) -> list[str]:
    rows = (
        db.query(func.trim(orm_models.User.organisation))
        .filter(
            orm_models.User.role == "admin",
            orm_models.User.organisation.isnot(None),
            func.trim(orm_models.User.organisation) != "",
        )
        .distinct()
        .order_by(func.trim(orm_models.User.organisation))
        .all()
    )
    return [row[0] for row in rows if row[0]]


def admin_org_filter(current_user: orm_models.User):
    org = (current_user.organisation or "").strip()
    if not org:
        return orm_models.User.id == current_user.id
    return func.trim(orm_models.User.organisation) == org


def admin_org_opportunity_filter(current_user: orm_models.User):
    org = (current_user.organisation or "").strip()
    if not org:
        return orm_models.Opportunity.author_id == current_user.id
    return orm_models.Opportunity.author.has(func.trim(orm_models.User.organisation) == org)


def display_user_name(user: orm_models.User | None, fallback: str) -> str:
    if not user:
        return fallback
    return user.full_name or user.username or fallback


def extract_schedule_text(message: str | None) -> str:
    if not message:
        return ""
    for part in message.split(" | "):
        part = part.strip()
        if part.lower().startswith("schedule:"):
            return part.split(":", 1)[1].strip()
    return ""


@router.get("/organisations", response_model=list[str])
def list_organisations(db: Session = Depends(database.get_db)):
    return get_admin_organisations(db)

@router.post("/signup", response_model=models.UserResponse)
def signup(user: models.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(orm_models.User).filter(orm_models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    if user.role != "admin":
        allowed_organisations = get_admin_organisations(db)
        if not user.organisation or user.organisation not in allowed_organisations:
            raise HTTPException(status_code=400, detail="Please select an approved organization or university")
    
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

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    identifier = form_data.username.strip()
    user = db.query(orm_models.User).filter(
        or_(
            orm_models.User.username == identifier,
            orm_models.User.email == identifier,
        )
    ).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    from datetime import timedelta
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/user", response_model=models.UserResponse)
def get_user(current_user: orm_models.User = Depends(auth.get_current_user)):
    return current_user


@router.put("/user", response_model=models.UserResponse)
def update_current_user(
    user_update: models.UserUpdate,
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    update_data = user_update.model_dump(exclude_unset=True)

    if "email" in update_data:
        existing_email_user = db.query(orm_models.User).filter(
            orm_models.User.email == update_data["email"],
            orm_models.User.id != current_user.id,
        ).first()
        if existing_email_user:
            raise HTTPException(status_code=400, detail="Email already registered")

    if "skills" in update_data:
        skill_names = update_data.pop("skills")
        current_user.skills = []
        if skill_names:
            for name in skill_names:
                name = name.strip()
                if not name: continue
                db_skill = db.query(orm_models.Skill).filter(orm_models.Skill.name == name).first()
                if not db_skill:
                    db_skill = orm_models.Skill(name=name)
                    db.add(db_skill)
                    db.flush()
                if db_skill not in current_user.skills:
                    current_user.skills.append(db_skill)

    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/notifications", response_model=list[models.NotificationResponse])
def get_notifications(
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    notifications = []
    pending_appointment_requests = db.query(orm_models.Invitation).filter(
        orm_models.Invitation.receiver_id == current_user.id,
        orm_models.Invitation.status == "pending",
    ).order_by(orm_models.Invitation.created_at.desc()).limit(2).all()
    accepted_appointment_requests = db.query(orm_models.Invitation).filter(
        orm_models.Invitation.sender_id == current_user.id,
        orm_models.Invitation.status == "accepted",
    ).order_by(orm_models.Invitation.created_at.desc()).limit(2).all()

    for invitation in pending_appointment_requests:
        sender_name = display_user_name(invitation.sender, "Someone")
        notifications.append(models.NotificationResponse(
            id=f"appointment-request-{invitation.id}",
            title="Appointment Request",
            message=f"{sender_name} sent you an appointment request for {invitation.topic}.",
            category="community",
            action_label="Respond",
            action_url="appointment.html",
        ))

    for invitation in accepted_appointment_requests:
        receiver_name = display_user_name(invitation.receiver, "the recipient")
        schedule_text = extract_schedule_text(invitation.message)
        schedule_sentence = f" The meeting is scheduled for {schedule_text}." if schedule_text else " A meeting is scheduled."
        notifications.append(models.NotificationResponse(
            id=f"appointment-accepted-{invitation.id}",
            title="Appointment Accepted",
            message=f"Your request for {invitation.topic} with {receiver_name} was accepted.{schedule_sentence}",
            category="community",
            action_label="Open appointments",
            action_url="appointment.html",
        ))

    if current_user.role == "admin":
        pending_invitations = db.query(orm_models.Invitation).filter(
            orm_models.Invitation.status == "pending",
            orm_models.Invitation.receiver.has(admin_org_filter(current_user)),
        ).count()
        active_opportunities = db.query(orm_models.Opportunity).filter(
            orm_models.Opportunity.status != "removed",
            admin_org_opportunity_filter(current_user),
        ).count()
        total_users = db.query(orm_models.User).filter(admin_org_filter(current_user)).count()

        notifications.extend([
            models.NotificationResponse(
                id="admin-users",
                title="Users Managed",
                message=f"{total_users} users are currently registered on the platform.",
                category="admin",
                action_label="View users",
                action_url="admin-manage-users.html",
            ),
            models.NotificationResponse(
                id="admin-opportunities",
                title="Opportunity Inventory",
                message=f"{active_opportunities} opportunities are available for contributors.",
                category="admin",
                action_label="Review",
                action_url="admin-manage-opportunities.html",
            ),
        ])

        if pending_invitations:
            notifications.append(models.NotificationResponse(
                id="admin-invitations",
                title="Pending Invitations",
                message=f"{pending_invitations} invitations are waiting for a response.",
                category="admin",
                action_label="Open appointments",
                action_url="appointment.html",
            ))
    else:
        applications = db.query(orm_models.UserOpportunity).filter(
            orm_models.UserOpportunity.user_id == current_user.id,
            orm_models.UserOpportunity.status.in_(["applied", "enrolled", "rejected", "completed"]),
        ).count()
        interests = db.query(orm_models.UserOpportunity).filter(
            orm_models.UserOpportunity.user_id == current_user.id,
            orm_models.UserOpportunity.status == "interested",
        ).count()
        invitations = db.query(orm_models.Invitation).filter(
            orm_models.Invitation.receiver_id == current_user.id,
            orm_models.Invitation.status == "pending",
        ).count()
        enrolled_records = db.query(orm_models.UserOpportunity).filter(
            orm_models.UserOpportunity.user_id == current_user.id,
            orm_models.UserOpportunity.status == "enrolled",
            orm_models.UserOpportunity.opportunity_id.isnot(None),
        ).order_by(orm_models.UserOpportunity.updated_at.desc()).limit(2).all()

        for record in enrolled_records:
            title = record.opportunity.title if record.opportunity else "this opportunity"
            notifications.append(models.NotificationResponse(
                id=f"user-enrolled-{record.id}",
                title="Successfully Enrolled",
                message=f"You have been successfully enrolled in {title}.",
                category="engagement",
                action_label="View dashboard",
                action_url="dashboard.html",
            ))

        notifications.extend([
            models.NotificationResponse(
                id="user-interests",
                title="Saved Interests",
                message=f"You have {interests} interested opportunities saved.",
                category="engagement",
                action_label="View",
                action_url="interested.html",
            ),
            models.NotificationResponse(
                id="user-applications",
                title="Applications",
                message=f"You have {applications} active application records.",
                category="engagement",
                action_label="Open dashboard",
                action_url="dashboard.html",
            ),
        ])

        if invitations:
            notifications.append(models.NotificationResponse(
                id="user-invitations",
                title="Pending Invitation",
                message=f"You have {invitations} pending collaboration invitations.",
                category="community",
                action_label="Open appointments",
                action_url="appointment.html",
            ))

    if not notifications:
        notifications.append(models.NotificationResponse(
            id="empty",
            title="No new notifications",
            message="You are all caught up.",
            category="system",
        ))

    return notifications[:5]

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}
