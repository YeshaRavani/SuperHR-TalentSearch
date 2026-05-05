from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List
from types import SimpleNamespace
from .. import models, orm_models, database
from ..services.ai_logic import answer_platform_question, build_personalized_suggestions, get_ranked_matches, groq_aided_chat
from ..utils import auth, resume_parser

router = APIRouter()

@router.post("/ai/parse-opportunity", response_model=models.AIOpportunityParseResponse)
async def parse_opportunity(
    request: models.AIOpportunityParseRequest,
    current_user: orm_models.User = Depends(auth.get_current_user)
):
    system_prompt = (
        "You are an AI assistant helping a recruiter create an opportunity post. "
        "From the provided natural language description, extract and structure the details into a JSON object. "
        "Fields to extract:\n"
        "1. title: A catchy and professional title.\n"
        "2. type: Must be one of 'Initiative', 'Workshop', or 'Event'.\n"
        "3. location: Specific venue or 'Remote'.\n"
        "4. description: A clear, multi-sentence professional description.\n"
        "5. schedule: Timeline or date info (e.g. 'Next 2 weeks', 'Every Monday').\n"
        "6. bounty: Integer value representing XP points reward. Default to 100 if not clear.\n"
        "7. time_commitment: Choose the closest match from: 'Less than 1 hour', '1-2 hours / week', '3-5 hours / week', '5-10 hours / week'.\n"
        "8. skills: List of relevant professional skills required.\n"
        "Return ONLY the JSON object matching the requested schema."
    )
    
    from ..services.groq_service import groq_service
    try:
        result = groq_service.get_chat_completion(request.description, system_prompt)
        # Ensure result has all required keys to match AIOpportunityParseResponse
        defaults = {
            "title": "", "type": "Initiative", "location": "Remote", 
            "description": "", "schedule": "TBD", "bounty": 100, 
            "time_commitment": "1-2 hours / week", "skills": []
        }
        for k, v in defaults.items():
            if k not in result:
                result[k] = v
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {str(e)}")

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
