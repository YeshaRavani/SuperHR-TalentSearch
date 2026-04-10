from typing import Iterable, List

from .. import orm_models


def normalize_terms(raw_text: str | None) -> List[str]:
    if not raw_text:
        return []
    separators = [",", "/", ";", "\n"]
    normalized = raw_text
    for separator in separators:
        normalized = normalized.replace(separator, ",")
    return [term.strip().lower() for term in normalized.split(",") if term.strip()]


def score_opportunity_match(user: orm_models.User, opportunity: orm_models.Opportunity) -> int:
    score = 0
    user_terms = set(normalize_terms(user.department_team) + normalize_terms(user.organisation))
    opportunity_text = " ".join(
        [
            opportunity.title or "",
            opportunity.short_description or "",
            opportunity.full_description or "",
            opportunity.expectations or "",
            opportunity.location or "",
        ]
    ).lower()

    for term in user_terms:
        if term and term in opportunity_text:
            score += 3

    if user.role and user.role.lower() in opportunity_text:
        score += 1
    if opportunity.status == "active":
        score += 1
    return score


def get_ranked_matches(user: orm_models.User, opportunities: Iterable[orm_models.Opportunity], limit: int = 5) -> List[orm_models.Opportunity]:
    scored = []
    for opportunity in opportunities:
        score = score_opportunity_match(user, opportunity)
        if score > 0:
            scored.append((score, opportunity.created_at, opportunity))

    scored.sort(key=lambda item: (item[0], item[1]), reverse=True)
    return [opportunity for _, _, opportunity in scored[:limit]]


def build_personalized_suggestions(user: orm_models.User, opportunities: Iterable[orm_models.Opportunity]) -> List[str]:
    matches = get_ranked_matches(user, opportunities, limit=2)
    suggestions = []

    if matches:
        suggestions.append(f"Top match right now: {matches[0].title}. Review the expectations and apply if it fits your schedule.")
    if user.department_team:
        suggestions.append(f"Add concrete skills next to '{user.department_team}' in your profile to improve recommendation quality.")
    if user.organisation:
        suggestions.append(f"Look for cross-team collaborations beyond {user.organisation} to increase your visible contribution footprint.")

    if not suggestions:
        suggestions.append("Complete your profile with department, organisation, and skills to unlock stronger recommendations.")

    return suggestions[:3]


def answer_platform_question(message: str, user: orm_models.User, opportunities: Iterable[orm_models.Opportunity]) -> tuple[str, List[str], List[str]]:
    prompt = message.lower().strip()
    matches = get_ranked_matches(user, opportunities, limit=3)
    opportunity_names = [opportunity.title for opportunity in matches]
    sources = []
    actions = []

    if any(keyword in prompt for keyword in ["match", "recommend", "opportunit", "apply"]):
        if opportunity_names:
            reply = "Based on your profile, the best current matches are " + ", ".join(opportunity_names) + "."
            sources = [f"Opportunity: {title}" for title in opportunity_names]
            actions = ["Open the opportunities page", "Review expectations before applying"]
        else:
            reply = "I could not find a strong opportunity match yet. Add more skills or team details to your profile first."
            actions = ["Update your profile", "Refresh AI matches after adding skills"]
        return reply, sources, actions

    if any(keyword in prompt for keyword in ["point", "reward", "leave"]):
        reply = (
            f"You currently have {user.total_points} reward points. Admins can configure whether points convert into leave hours."
        )
        sources = ["User rewards summary", "Admin reward policy"]
        actions = ["Open dashboard", "Check reward policy with an admin"]
        return reply, sources, actions

    if any(keyword in prompt for keyword in ["community", "channel", "chat"]):
        reply = "Use the community page to browse channels, post updates, and message members directly."
        sources = ["Community channels", "Direct messages"]
        actions = ["Open community page", "Join an active channel"]
        return reply, sources, actions

    reply = (
        "I can help with opportunity recommendations, application guidance, community navigation, and reward questions."
    )
    actions = ["Ask for recommended opportunities", "Ask about rewards", "Ask how to use community chat"]
    return reply, sources, actions
