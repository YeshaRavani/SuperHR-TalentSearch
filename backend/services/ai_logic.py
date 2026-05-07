from typing import Any, Dict, Iterable, List

from .. import orm_models
from .groq_service import groq_service
from .platform_knowledge import (
    PLATFORM_OVERVIEW,
    answer_navigation_question,
    build_platform_context,
    get_allowed_actions,
    get_page_sources,
)


ALLOWED_ACTIONS = {action.lower(): action for action in get_allowed_actions()}
EMOTIONAL_KEYWORDS = {
    "depressed", "sad", "stressed", "anxious", "anxiety", "overwhelmed", "burned out", "burnt out",
    "lonely", "upset", "frustrated", "tired", "hopeless",
}
APPRECIATION_KEYWORDS = {"nice", "great", "awesome", "love", "liked", "like the platform", "helpful"}
ENROLLMENT_KEYWORDS = {"enrollment", "enrolment", "enrollments", "enrolments", "responses", "visibility", "noticed"}


def is_greeting(prompt: str) -> bool:
    normalized = prompt.strip().lower()
    return normalized in {"hi", "hey", "hello", "yo", "hiya", "good morning", "good afternoon", "good evening"}


def is_short_acknowledgement(prompt: str) -> bool:
    normalized = prompt.strip().lower()
    return normalized in {"ok", "okay", "cool", "nice", "thanks", "thank you", "got it", "sure"}


def is_emotional_support_message(prompt: str) -> bool:
    normalized = prompt.strip().lower()
    return any(keyword in normalized for keyword in EMOTIONAL_KEYWORDS)


def is_appreciation_message(prompt: str) -> bool:
    normalized = prompt.strip().lower()
    return any(keyword in normalized for keyword in APPRECIATION_KEYWORDS) or normalized.startswith("i like")


def is_platform_troubleshooting_message(prompt: str) -> bool:
    normalized = prompt.strip().lower()
    problem_words = ["not getting", "not seeing", "not working", "no one is", "nobody is", "low", "issue", "problem"]
    return (
        any(phrase in normalized for phrase in problem_words)
        and any(keyword in normalized for keyword in ENROLLMENT_KEYWORDS | {"application", "apply", "match", "opportunity", "profile"})
    )


def build_recent_history(history: List[object] | None) -> str:
    history = history or []
    turns = []
    for item in history[-6:]:
        role = getattr(item, "role", None) or item.get("role")
        content = getattr(item, "content", None) or item.get("content")
        if role and content:
            turns.append(f"{role.title()}: {content.strip()}")
    return "\n".join(turns)


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


def summarize_runtime_context(runtime_context: Dict[str, Any] | None) -> str:
    if not runtime_context:
        return "- Runtime data unavailable"

    lines = [
        f"- Authenticated: {'yes' if runtime_context.get('is_authenticated') else 'no'}",
        f"- Visible opportunities: {runtime_context.get('visible_opportunity_count', 0)}",
        f"- Organisation: {runtime_context.get('organisation') or 'Guest'}",
    ]
    channels = runtime_context.get("channels") or []
    if channels:
        lines.append("- Community channels: " + ", ".join(channels[:6]))
    for key, label in [
        ("applications", "Your applications"),
        ("interests", "Your saved interests"),
        ("posted_opportunities", "Your posted opportunities"),
        ("pending_invitations", "Your pending invitations"),
        ("organisation_users", "Organisation users"),
        ("organisation_applications", "Organisation applications"),
        ("organisation_interests", "Organisation interests"),
    ]:
        if key in runtime_context:
            lines.append(f"- {label}: {runtime_context[key]}")
    if runtime_context.get("admin_scope"):
        lines.append(f"- Admin scope: {runtime_context['admin_scope']}")
    return "\n".join(lines)


def answer_platform_question(
    message: str,
    user: orm_models.User,
    opportunities: Iterable[orm_models.Opportunity],
    history: List[object] | None = None,
    runtime_context: Dict[str, Any] | None = None,
) -> tuple[str, List[str], List[str]]:
    prompt = message.lower().strip()
    matches = get_ranked_matches(user, opportunities, limit=3)
    opportunity_names = [opportunity.title for opportunity in matches]
    sources = []
    actions = []
    history = history or []

    if is_greeting(prompt):
        return (
            "Hi! I can help you find opportunities, explain rewards, or show you where things live in the platform.",
            [],
            [],
        )

    if is_short_acknowledgement(prompt):
        return (
            "Sure. Tell me what you want to do and I’ll help from there.",
            [],
            [],
        )

    if is_emotional_support_message(prompt):
        reply = (
            "I’m sorry you’re feeling that way. I’m not a mental health professional, but talking to someone you trust or getting support from a professional can help. "
            "If this is connected to your experience on the platform, tell me what’s going wrong and I’ll help you work through it."
        )
        return reply, [], []

    if is_appreciation_message(prompt):
        reply = "Glad to hear that. If you want, I can help you find good opportunities, improve your profile, or show you useful parts of the platform."
        return reply, [], []

    if is_platform_troubleshooting_message(prompt):
        reply = (
            "That usually means your profile, skill tags, or opportunity fit may not be strong enough yet. "
            "Start by updating your skills, applying to opportunities that closely match them, and staying active in community discussions so your work is more visible."
        )
        sources = ["Page: Profile", "Page: Opportunities", "Page: Community"]
        actions = ["Update your profile", "Browse opportunities"]
        return reply, sources, actions

    if any(keyword in prompt for keyword in ["capital of", "weather", "stock price", "who won", "define ", "translate "]):
        reply = (
            "I am a platform assistant for SuperHR Talent Search, so I can help with opportunities, rewards, and community features."
        )
        actions = ["Ask about recommended opportunities", "Ask about rewards", "Ask how to use community chat"]
        return reply, sources, actions

    if "admin" in prompt:
        if (user.role or "").lower() == "admin":
            reply = (
                "Admins can manage users, review opportunities, adjust reward policy, and access system settings. "
                "Your admin pages are scoped to your own organisation, so dashboard counts, users, opportunities, applicants, and notifications only show that organisation."
            )
            sources = ["Page: Admin Home", "Page: Admin Manage Users", "Page: Admin Manage Opportunities", "Page: Admin System Settings"]
            actions = ["Open admin manage users", "Open admin manage opportunities"]
        else:
            reply = "Admin tools exist for managing users, opportunities, and system settings, but they are available only to admin accounts."
            sources = ["Page: Admin Manage Users", "Page: Admin Manage Opportunities", "Page: Admin System Settings"]
            actions = ["Browse opportunities", "Ask about rewards"]
        return reply, sources, actions

    if any(keyword in prompt for keyword in ["where do i", "how do i", "where can i", "go to", "find"]) and any(keyword in prompt for keyword in ["opportunities", "browse", "profile", "community", "dashboard", "posted", "appointment", "login"]):
        navigation_answer = answer_navigation_question(message, (user.role or "contributors").lower())
        if navigation_answer:
            return navigation_answer

    if any(keyword in prompt for keyword in ["post", "create", "add"]) and "opportunit" in prompt:
        reply = (
            "Use the Add Opportunity page to create a post. The platform now treats posts as general opportunities, "
            "so you do not need to choose event, initiative, or workshop."
        )
        return reply, ["Page: Add Opportunity", "Page: Posted Opportunities"], ["Open add opportunity page", "Open posted opportunities page"]

    if any(keyword in prompt for keyword in ["match", "recommend", "opportunit", "apply"]):
        if opportunity_names:
            reply = "Based on your profile, the best current matches are " + ", ".join(opportunity_names) + "."
            sources = [f"Opportunity: {title}" for title in opportunity_names]
            actions = ["Open opportunities page", "Review expectations before applying"]
        else:
            reply = "I could not find a strong opportunity match yet. Add more skills or team details to your profile first."
            actions = ["Update your profile", "Refresh AI matches"]
        return reply, sources, actions

    if any(keyword in prompt for keyword in ["point", "reward", "leave"]):
        reply = (
            f"You currently have {user.total_points} reward points. Admins can configure whether points convert into leave hours."
        )
        sources = ["User rewards summary", "Admin reward policy"]
        actions = ["Open dashboard", "Check reward policy with an admin"]
        return reply, sources, actions

    if any(keyword in prompt for keyword in ["community", "channel", "chat"]):
        channels = runtime_context.get("channels", []) if runtime_context else []
        channel_text = f" Current channels include {', '.join(channels[:3])}." if channels else ""
        reply = f"Use the Community page to browse channels, post updates, and message members directly.{channel_text}"
        sources = ["Page: Community", "Community channels", "Direct messages"]
        actions = ["Open community page", "Join an active channel"]
        return reply, sources, actions

    if any(keyword in prompt for keyword in ["platform", "how does this work", "what can i do", "how does this platform work"]):
        reply = (
            f"{PLATFORM_OVERVIEW} Start with Opportunities for discovery, Profile for skills, Dashboard for progress, and Community for collaboration."
        )
        sources = ["Page: Opportunities", "Page: Profile", "Page: Dashboard", "Page: Community"]
        actions = ["Browse opportunities", "Update your profile"]
        return reply, sources, actions

    navigation_answer = answer_navigation_question(message, (user.role or "contributors").lower())
    if navigation_answer:
        return navigation_answer

    reply = "I can help with platform navigation, finding opportunities, improving your profile, rewards, and community features."
    if history:
        reply = "I’m here for platform questions. Tell me what you’re trying to do or what’s not working, and I’ll guide you."
    actions = ["Browse opportunities", "Update your profile"]
    return reply, sources, actions


def build_groq_context(user: orm_models.User, opportunities: List[orm_models.Opportunity], runtime_context: Dict[str, Any] | None = None) -> str:
    """Build a concise, grounded context block for the model."""
    ranked = get_ranked_matches(user, opportunities, limit=5)
    opps_summary = "\n".join(
        [f"- {o.title}: {o.short_description}" for o in ranked]
    ) or "- No strong matches found"

    context = f"""
User Profile:
- Name: {user.full_name}
- Role: {user.role}
- Organisation: {user.organisation}
- Team: {user.department_team}
- Points: {user.total_points}

Top Matched Opportunities:
{opps_summary}

Platform Features:
- Users can browse opportunities, mark interest, apply, post opportunities, and review applicants on their own posts.
- Users earn points for contributions and can track applications, interests, invitations, and posted opportunities.
- Community has channels, member discovery, direct messages, and collaboration invitations.
- Opportunity type segregation has been removed; the platform now presents posts as general opportunities with skill filtering.
- Contributor signup uses a dropdown of admin-approved organisations; admin signup can create a new organisation freely.
- Admin dashboards, users, opportunities, applicants, profile metrics, and notifications are organisation-scoped.

Live Platform Data:
{summarize_runtime_context(runtime_context)}
"""
    platform_context = build_platform_context("", (user.role or "contributors").lower())
    return context + "\n" + platform_context


def sanitize_sources(raw_sources: List[str], opportunities: List[orm_models.Opportunity]) -> List[str]:
    allowed_sources = {"User rewards summary", "Admin reward policy", "Community channels", "Direct messages", "Runtime: Platform data"}
    allowed_sources.update({f"Opportunity: {o.title}" for o in opportunities})
    allowed_sources.update(get_page_sources())

    cleaned = []
    for source in raw_sources:
        if not isinstance(source, str):
            continue
        source = source.strip()
        if source in allowed_sources and source not in cleaned:
            cleaned.append(source)
    return cleaned[:3]


def sanitize_actions(raw_actions: List[str], message: str, user: orm_models.User, opportunities: List[orm_models.Opportunity], history: List[object] | None = None) -> List[str]:
    cleaned = []
    for action in raw_actions:
        if not isinstance(action, str):
            continue
        normalized = " ".join(action.strip().split()).lower()
        if normalized in ALLOWED_ACTIONS and ALLOWED_ACTIONS[normalized] not in cleaned:
            cleaned.append(ALLOWED_ACTIONS[normalized])

    if cleaned:
        return cleaned[:2]

    _, _, fallback_actions = answer_platform_question(message, user, opportunities, history)
    return fallback_actions[:2]


def groq_aided_chat(
    message: str,
    user: orm_models.User,
    opportunities: List[orm_models.Opportunity],
    history: List[object] | None = None,
    runtime_context: Dict[str, Any] | None = None,
) -> tuple[str, List[str], List[str]]:
    """Use Groq when available; otherwise fall back to deterministic logic."""
    history = history or []

    if is_greeting(message):
        return (
            "Hi! I can help you explore opportunities, understand rewards, or find your way around the platform.",
            [],
            [],
        )

    if is_short_acknowledgement(message):
        return (
            "Sure. Tell me what you want to do and I’ll point you in the right direction.",
            [],
            [],
        )

    if is_emotional_support_message(message):
        return answer_platform_question(message, user, opportunities, history, runtime_context)

    if is_appreciation_message(message):
        return answer_platform_question(message, user, opportunities, history, runtime_context)

    if is_platform_troubleshooting_message(message):
        return answer_platform_question(message, user, opportunities, history, runtime_context)

    if not groq_service.is_available():
        return answer_platform_question(message, user, opportunities, history, runtime_context)

    role = (user.role or "contributors").lower()
    context = build_groq_context(user, opportunities, runtime_context)
    contextual_platform_knowledge = build_platform_context(message, role)
    recent_history = build_recent_history(history)
    system_prompt = f"""
You are the SuperHR Talent Search Assistant. Your goal is to help users find opportunities, explain platform rewards, and navigate community features naturally.

Grounded context:
{context}

Question-specific platform knowledge:
{contextual_platform_knowledge}

Recent conversation:
{recent_history or "- No prior turns"}

Requirements:
1. Use the provided context only. Do not hallucinate.
2. If asked for recommendations, suggest items from the 'Top Matched Opportunities' list.
3. Keep answers concise, helpful, and conversational. Avoid robotic support-language unless needed.
4. If a question is out of scope (not about the platform or opportunities), politely steer the user back.
5. Never include internal IDs, UUIDs, database references, or debug text in the reply or actions.
6. `suggested_actions` must contain only items from this exact list:
   - Open home page
   - Open opportunities page
   - Browse opportunities
   - Open add opportunity page
   - Review expectations before applying
   - Update your profile
   - Refresh AI matches
   - Open dashboard
   - Check reward policy
   - Open community page
   - Join an active channel
   - Ask about recommended opportunities
   - Ask about rewards
   - Ask how to use community chat
   - Open posted opportunities page
   - Open appointment page
   - Open login page
   - Open contributor signup
   - Open admin signup
   - Open admin home
   - Open admin manage users
   - Open admin manage opportunities
   - Open admin system settings
   - Open admin profile
7. When the user asks where or how to do something, mention the actual page name if it exists in context.
8. Do not claim a page or feature exists unless it appears in the provided platform knowledge.
9. If the user asks about admin capabilities and they are not an admin, explain that admin tools exist but are restricted.
10. For greetings or lightweight acknowledgement turns, respond naturally and leave `suggested_actions` empty.
11. Only include `suggested_actions` when they are genuinely useful next steps.
12. If the user expresses frustration, low engagement, poor enrollments, or trouble getting noticed, give practical platform advice about profile quality, fit, and visibility.
13. If the user expresses appreciation, respond naturally instead of switching to a product summary.
14. If the user expresses emotional distress, respond with empathy first, do not ignore it, and only redirect to platform help if appropriate.
15. You MUST return JSON in the following format:
{{
  "reply": "your response string",
  "sources": ["list of source names, e.g. 'Project: Alpha'", "User Points"],
  "suggested_actions": ["Action 1", "Action 2"]
}}
"""
    try:
        prompt = message
        if recent_history:
            prompt = f"Conversation so far:\n{recent_history}\n\nLatest user message:\n{message}"

        response = groq_service.get_chat_completion(prompt, system_prompt)
        reply = response.get("reply", "I'm having trouble processing that right now.")
        sources = sanitize_sources(response.get("sources", []), opportunities)
        suggested_actions = sanitize_actions(response.get("suggested_actions", []), message, user, opportunities, history)
        if is_greeting(message) or is_short_acknowledgement(message):
            sources = []
            suggested_actions = []
        return (
            reply,
            sources,
            suggested_actions,
        )
    except Exception:
        # Fallback to deterministic logic on any API or parsing error
        return answer_platform_question(message, user, opportunities, history, runtime_context)
