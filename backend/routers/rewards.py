from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import database, models, orm_models
from ..utils import auth

router = APIRouter()


@router.get("/rewards/me", response_model=models.RewardsSummaryResponse)
def get_my_rewards(
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    policy = db.query(orm_models.RewardPolicy).first()
    if not policy:
        policy = orm_models.RewardPolicy(active_mode="points", hours_per_leave=8)
        db.add(policy)
        db.commit()
        db.refresh(policy)

    leave_hours_available = 0.0
    if policy.hours_per_leave:
        leave_hours_available = round(current_user.total_points / policy.hours_per_leave, 2)

    return models.RewardsSummaryResponse(
        user_id=current_user.id,
        total_points=current_user.total_points,
        active_mode=policy.active_mode,
        hours_per_leave=policy.hours_per_leave,
        leave_hours_available=leave_hours_available,
    )
