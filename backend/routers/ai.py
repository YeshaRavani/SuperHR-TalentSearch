from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, orm_models, database
from ..services.ai_logic import answer_platform_question, build_personalized_suggestions, get_ranked_matches
from ..utils import auth

router = APIRouter()

@router.get("/ai/match", response_model=List[models.OpportunityResponse])
def get_ai_matches(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    all_opps = db.query(orm_models.Opportunity).all()
    return get_ranked_matches(current_user, all_opps)

@router.get("/ai/suggestions")
def get_ai_suggestions(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    opportunities = db.query(orm_models.Opportunity).all()
    return build_personalized_suggestions(current_user, opportunities)


@router.post("/ai/chat", response_model=models.AIChatResponse)
def chat_with_ai(
    request: models.AIChatRequest,
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    opportunities = db.query(orm_models.Opportunity).all()
    reply, sources, suggested_actions = answer_platform_question(request.message, current_user, opportunities)
    return models.AIChatResponse(reply=reply, sources=sources, suggested_actions=suggested_actions)
