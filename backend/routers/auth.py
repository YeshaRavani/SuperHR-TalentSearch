from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .. import database, orm_models, models
from ..utils import auth
import uuid

router = APIRouter()

@router.post("/signup", response_model=models.UserResponse)
def signup(user: models.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(orm_models.User).filter(orm_models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
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

    if current_user.role == "admin":
        pending_invitations = db.query(orm_models.Invitation).filter(
            orm_models.Invitation.status == "pending"
        ).count()
        active_opportunities = db.query(orm_models.Opportunity).filter(
            orm_models.Opportunity.status != "removed"
        ).count()
        total_users = db.query(orm_models.User).count()

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
