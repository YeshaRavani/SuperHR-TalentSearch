from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from types import SimpleNamespace
import re
from .. import models, orm_models, database
from ..services.ai_logic import answer_platform_question, build_personalized_suggestions, get_ranked_matches, groq_aided_chat
from ..utils import auth, resume_parser

router = APIRouter()


KNOWN_SKILLS = [
    "Python", "JavaScript", "HTML", "CSS", "React", "FastAPI", "SQL", "Figma", "Canva",
    "Design", "Photography", "Video Editing", "Writing", "Marketing", "Communication",
    "Leadership", "Project Management", "Data Analysis", "Machine Learning", "Research",
    "Event Management", "Coordination", "Social Media", "Public Speaking",
]


def normalise_org(user) -> str:
    return (getattr(user, "organisation", None) or "").strip()


def visible_opportunity_query(db: Session, current_user):
    query = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.status != "removed")
    if not current_user or not getattr(current_user, "id", None):
        return query

    role = (getattr(current_user, "role", "") or "").lower()
    org = normalise_org(current_user)
    if role == "admin":
        if org:
            return query.filter(
                orm_models.Opportunity.author.has(func.trim(orm_models.User.organisation) == org)
            )
        return query.filter(orm_models.Opportunity.author_id == current_user.id)

    if org:
        query = query.filter(
            orm_models.Opportunity.author.has(func.trim(orm_models.User.organisation) == org)
        )
    return query.filter(orm_models.Opportunity.author_id != current_user.id)


def build_chat_runtime_context(db: Session, current_user, opportunities: list[orm_models.Opportunity]) -> dict:
    role = (getattr(current_user, "role", None) or "guest").lower()
    org = normalise_org(current_user)
    context = {
        "role": role,
        "organisation": org or "Guest",
        "visible_opportunity_count": len(opportunities),
        "channels": [
            channel.name
            for channel in db.query(orm_models.Channel).order_by(orm_models.Channel.name.asc()).limit(8).all()
        ],
        "sources": ["Runtime: Platform data"],
    }

    if not getattr(current_user, "id", None):
        context.update({
            "is_authenticated": False,
            "user_summary": "Guest users can browse public pages, log in, or sign up.",
        })
        return context

    applications = (
        db.query(orm_models.UserOpportunity)
        .filter(
            orm_models.UserOpportunity.user_id == current_user.id,
            orm_models.UserOpportunity.status.in_(["applied", "enrolled", "rejected", "completed"]),
        )
        .count()
    )
    interests = (
        db.query(orm_models.UserOpportunity)
        .filter(
            orm_models.UserOpportunity.user_id == current_user.id,
            orm_models.UserOpportunity.status == "interested",
        )
        .count()
    )
    posted = (
        db.query(orm_models.Opportunity)
        .filter(
            orm_models.Opportunity.author_id == current_user.id,
            orm_models.Opportunity.status != "removed",
        )
        .count()
    )
    pending_invites = (
        db.query(orm_models.Invitation)
        .filter(
            orm_models.Invitation.receiver_id == current_user.id,
            orm_models.Invitation.status == "pending",
        )
        .count()
    )
    context.update({
        "is_authenticated": True,
        "applications": applications,
        "interests": interests,
        "posted_opportunities": posted,
        "pending_invitations": pending_invites,
    })

    if role == "admin":
        user_query = db.query(orm_models.User)
        if org:
            user_query = user_query.filter(func.trim(orm_models.User.organisation) == org)
        else:
            user_query = user_query.filter(orm_models.User.id == current_user.id)

        org_users = user_query.count()
        visible_ids = [opportunity.id for opportunity in opportunities]
        engagement_query = db.query(orm_models.UserOpportunity).filter(
            orm_models.UserOpportunity.opportunity_id.in_(visible_ids) if visible_ids else False,
            orm_models.UserOpportunity.user.has(func.trim(orm_models.User.organisation) == org) if org else orm_models.UserOpportunity.user_id == current_user.id,
        )
        context.update({
            "admin_scope": f"Only {org or 'this admin account'} organisation data is visible.",
            "organisation_users": org_users,
            "organisation_applications": engagement_query.filter(orm_models.UserOpportunity.status == "applied").count(),
            "organisation_interests": engagement_query.filter(orm_models.UserOpportunity.status == "interested").count(),
        })

    return context


def fallback_opportunity_parse(description: str) -> dict:
    text = " ".join(description.split())
    text = re.sub(r"\bposte\b", "post", text, flags=re.I)
    text = re.sub(r"\bon\s+opportunit(y|ies)\b", "an opportunity", text, flags=re.I)
    first_sentence = re.split(r"[.!?\n]", text, maxsplit=1)[0].strip()
    title = first_sentence
    title = re.sub(r"^(please\s+)?(post|posted|posting|create|add|draft|make)\s+(an?\s+)?(opportunity|role|task|project|opening)\s+(for|about|to)?\s*", "", title, flags=re.I)
    title = re.sub(r"^(need|looking for|we need|i need)\s+", "", title, flags=re.I).strip()
    if not title:
        title = "New Opportunity"
    title = title[:70].strip().title()

    lower = text.lower()
    location = "Remote" if "remote" in lower else "TBD"
    location_match = re.search(r"(?:at|in|from)\s+([A-Z][A-Za-z0-9\s-]{2,40})(?:\.|,| for | over | next |$)", text)
    if location_match and "week" not in location_match.group(1).lower():
        location = location_match.group(1).strip()

    bounty = 100
    bounty_match = re.search(r"(\d{2,5})\s*(?:xp|points|point|reward)", lower)
    if bounty_match:
        bounty = int(bounty_match.group(1))

    schedule = "TBD"
    schedule_match = re.search(r"(next\s+\d+\s+weeks?|next\s+week|this\s+week|every\s+\w+|by\s+[^.]+)", lower)
    if schedule_match:
        schedule = schedule_match.group(1).strip().capitalize()

    time_commitment = "1-2 hours / week"
    # Helper to convert daily to weekly (assuming 5 days)
    daily_match = re.search(r"(\d+)\s*(?:hrs?|hours?)\s*(?:per day|daily|a day)", lower)
    if daily_match:
        daily_hrs = int(daily_match.group(1))
        weekly_hrs = daily_hrs * 5
        if weekly_hrs < 1: time_commitment = "Less than 1 hour"
        elif weekly_hrs <= 2: time_commitment = "1-2 hours / week"
        elif weekly_hrs < 5: time_commitment = "3-5 hours / week"
        else: time_commitment = "5-10 hours / week"
    elif re.search(r"less than\s+1|<\s*1|under\s+1", lower):
        time_commitment = "Less than 1 hour"
    elif re.search(r"3\s*[-–]\s*5|three\s+to\s+five", lower):
        time_commitment = "3-5 hours / week"
    elif re.search(r"5\s*[-–]\s*10|five\s+to\s+ten", lower):
        time_commitment = "5-10 hours / week"
    elif re.search(r"1\s*[-–]\s*2|one\s+to\s+two|\b2\s*hours?\b|\btwo\s+hours?\b", lower):
        time_commitment = "1-2 hours / week"

    skills = [skill for skill in KNOWN_SKILLS if skill.lower() in lower]
    if not skills:
        skills = ["Communication", "Coordination"]

    return {
        "title": title,
        "type": "Opportunity",
        "location": location,
        "description": text or "Opportunity details to be reviewed.",
        "schedule": schedule,
        "bounty": bounty,
        "time_commitment": time_commitment,
        "skills": skills[:8],
    }

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
        "2. type: Always use 'Opportunity'.\n"
        "3. location: Specific venue or 'Remote'.\n"
        "4. description: A clear, multi-sentence professional description.\n"
        "5. schedule: Timeline or date info (e.g. 'Next 2 weeks', 'Every Monday').\n"
        "6. bounty: Integer value representing XP points reward. Default to 100 if not clear.\n"
        "7. time_commitment: Choose the closest match from: 'Less than 1 hour', '1-2 hours / week', '3-5 hours / week', '5-10 hours / week'. "
        "If the user specifies daily hours, convert them to weekly (e.g. 1 hour per day = 5 hours / week).\n"
        "8. skills: List of relevant professional skills required.\n"
        "Return ONLY the JSON object matching the requested schema."
    )
    
    from ..services.groq_service import groq_service
    try:
        result = groq_service.get_chat_completion(request.description, system_prompt)
        original_keys = set(result.keys())
        # Ensure result has all required keys to match AIOpportunityParseResponse
        defaults = {
            "title": "", "type": "Opportunity", "location": "Remote",
            "description": "", "schedule": "TBD", "bounty": 100, 
            "time_commitment": "1-2 hours / week", "skills": []
        }
        for k, v in defaults.items():
            if k not in result:
                result[k] = v
        result["type"] = "Opportunity"
        fallback = fallback_opportunity_parse(request.description)
        if not str(result.get("title") or "").strip():
            result["title"] = fallback["title"]
        if not str(result.get("description") or "").strip():
            result["description"] = fallback["description"]
        for field in ["location", "schedule", "bounty", "time_commitment"]:
            if field not in original_keys or result.get(field) in {None, "", "TBD"}:
                result[field] = fallback[field]
        if not result.get("skills"):
            result["skills"] = fallback["skills"]
        return result
    except Exception:
        return fallback_opportunity_parse(request.description)

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
    if current_user is None:
        current_user = SimpleNamespace(
            id=None,
            full_name="Guest User",
            role="contributors",
            organisation="Guest",
            department_team="",
            total_points=0,
        )
    opportunities = visible_opportunity_query(db, current_user).order_by(orm_models.Opportunity.created_at.desc()).all()
    runtime_context = build_chat_runtime_context(db, current_user, opportunities)
    reply, sources, suggested_actions = groq_aided_chat(
        request.message,
        current_user,
        opportunities,
        request.history,
        runtime_context,
    )
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
        if not text.strip():
            print("DEBUG: Resume parsing returned empty text")
            return {"error": "Failed to extract text from PDF. Is it a scanned image?", "skills": []}
    except Exception as e:
        print(f"DEBUG: Resume parsing failed: {str(e)}")
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
    
    print(f"DEBUG: Extracting skills from text of length {len(text)}")
    try:
        from ..services.groq_service import groq_service
        result = groq_service.get_chat_completion(prompt, system_prompt)
        skills = result.get("skills", [])
        print(f"DEBUG: Extracted {len(skills)} skills")
        return {"skills": skills}
    except Exception as e:
        print(f"DEBUG: AI extraction failed: {str(e)}")
        return {"error": f"AI extraction failed: {str(e)}", "skills": []}

@router.post("/ai/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: orm_models.User = Depends(auth.get_current_user)
):
    import os
    import tempfile
    
    # Save uploaded file to temp
    extension = os.path.splitext(file.filename)[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        from ..services.groq_service import groq_service
        text = groq_service.create_transcription(tmp_path)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
