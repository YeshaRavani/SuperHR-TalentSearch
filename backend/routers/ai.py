from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from types import SimpleNamespace
from .. import models, orm_models, database
from ..services.ai_logic import answer_platform_question, build_personalized_suggestions, get_ranked_matches, groq_aided_chat
from ..utils import auth, resume_parser

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
    current_user: orm_models.User | None = Depends(auth.get_optional_current_user),
    db: Session = Depends(database.get_db),
):
    opportunities = db.query(orm_models.Opportunity).all()
    if current_user is None:
        current_user = SimpleNamespace(
            full_name="Guest User",
            role="contributors",
            organisation="Guest",
            department_team="",
            total_points=0,
        )
    reply, sources, suggested_actions = groq_aided_chat(request.message, current_user, opportunities, request.history)
    return models.AIChatResponse(reply=reply, sources=sources, suggested_actions=suggested_actions)

@router.post("/ai/extract-skills")
async def extract_skills(
    file: UploadFile = File(...),
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Parse text from PDF
    try:
        text = await resume_parser.parse_resume_text(file)
    except Exception as e:
        return {"error": f"Failed to parse resume: {str(e)}", "skills": []}

    # 2. Use Groq to extract skills
    system_prompt = (
        "You are an expert Talent Acquisition AI. Your task is to extract a comprehensive list of professional skills from the provided resume text. "
        "Extract as many relevant skills as possible, including: \n"
        "1. Technical/Hard Skills (languages, tools, frameworks)\n"
        "2. Soft Skills (leadership, communication, problem solving)\n"
        "3. Domain/Industry Knowledge\n"
        "Return ONLY a JSON object with a 'skills' key containing a flat list of strings. Do not include categories in the strings."
    )
    prompt = f"Resume text:\n{text[:6000]}" # Slightly increased limit
    
    try:
        from ..services.groq_service import groq_service
        result = groq_service.get_chat_completion(prompt, system_prompt)
        return {"skills": result.get("skills", [])}
    except Exception as e:
        return {"error": f"AI extraction failed: {str(e)}", "skills": []}
