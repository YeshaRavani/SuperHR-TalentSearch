from typing import Dict, List


PLATFORM_OVERVIEW = (
    "SuperHR Talent Search helps users discover opportunities, mark interest, apply, "
    "post opportunities, track rewards, collaborate in community chat, and manage profile progress. "
    "Admins manage only the users, opportunities, applicants, notifications, and dashboard data for their own organisation."
)


PAGES: List[Dict[str, object]] = [
    {
        "name": "Home",
        "path": "index (1).html",
        "description": "Public landing page with Login and Get Involved options. Logged-in users are redirected to their role-specific home.",
        "keywords": ["home", "landing", "start", "main page", "get involved", "public page"],
        "actions": ["Open home page", "Open login page"],
    },
    {
        "name": "Login",
        "path": "login.html",
        "description": "Sign-in page for returning users and the gateway to the authenticated experience.",
        "keywords": ["login", "sign in", "account access", "authentication"],
        "actions": ["Open login page"],
    },
    {
        "name": "Contributor Signup",
        "path": "contributor-details.html",
        "description": "Contributor signup form. Contributors must select an approved organisation/university from the organisations created by admins.",
        "keywords": ["user signup", "contributor signup", "register user", "organization dropdown", "university dropdown"],
        "actions": ["Open contributor signup"],
    },
    {
        "name": "Admin Signup",
        "path": "admin-details.html",
        "description": "Admin signup form. Admins can enter their organisation/university freely; that organisation becomes available to contributors.",
        "keywords": ["admin signup", "register admin", "admin organisation", "admin organization"],
        "actions": ["Open admin signup"],
    },
    {
        "name": "Dashboard",
        "path": "dashboard.html",
        "description": "User dashboard showing welcome content, stats, and reward-related activity.",
        "keywords": ["dashboard", "points", "stats", "rewards", "overview"],
        "actions": ["Open dashboard", "Check reward policy"],
    },
    {
        "name": "Profile",
        "path": "profile.html",
        "description": "Profile page where users manage skills, preferred domains, and completion progress.",
        "keywords": ["profile", "skills", "edit profile", "completion"],
        "actions": ["Update your profile", "Refresh AI matches"],
    },
    {
        "name": "Opportunities",
        "path": "opportunities.html",
        "description": "Main browsing page for opportunities, with filtering by skill areas. Contributors cannot apply to their own posted opportunities.",
        "keywords": ["opportunities", "browse", "discover", "skills", "apply", "interested"],
        "actions": ["Open opportunities page", "Browse opportunities"],
    },
    {
        "name": "Add Opportunity",
        "path": "add-opportunity.html",
        "description": "Authenticated page for creating a new opportunity. The AI assistant can parse a natural language posting request, open this page, and prefill editable fields before the user posts with one button. The form no longer separates opportunity type into event, initiative, or workshop.",
        "keywords": ["add opportunity", "post opportunity", "create opportunity", "new opportunity"],
        "actions": ["Open add opportunity page", "Open posted opportunities page"],
    },
    {
        "name": "Interested Opportunities",
        "path": "interested.html",
        "description": "Shows opportunities the user has marked as interested and lets them remove interest.",
        "keywords": ["interested", "saved", "my interested", "bookmarked"],
        "actions": ["Browse opportunities"],
    },
    {
        "name": "Posted Opportunities",
        "path": "posted-opportunities.html",
        "description": "Tracks opportunities the current user posted and their applicant activity.",
        "keywords": ["posted opportunities", "my posts", "authored opportunities", "posted"],
        "actions": ["Open posted opportunities page"],
    },
    {
        "name": "Community",
        "path": "community.html",
        "description": "Community chat area with channels, member discovery, and messaging features.",
        "keywords": ["community", "chat", "channels", "members", "messages"],
        "actions": ["Open community page", "Join an active channel"],
    },
    {
        "name": "Appointment",
        "path": "appointment.html",
        "description": "Booking and invitation-related page for scheduling collaboration or follow-up conversations.",
        "keywords": ["appointment", "book", "meeting", "invitation", "schedule"],
        "actions": ["Open appointment page"],
    },
    {
        "name": "Admin Home",
        "path": "admin-home.html",
        "description": "Admin dashboard overview for platform operations.",
        "keywords": ["admin home", "admin dashboard", "admin overview"],
        "actions": ["Open admin home"],
        "roles": ["admin"],
    },
    {
        "name": "Admin Manage Users",
        "path": "admin-manage-users.html",
        "description": "Admin-only page for viewing and removing users in the admin's organisation, plus reward policy controls.",
        "keywords": ["manage users", "admin users", "roles", "reward policy"],
        "actions": ["Open admin manage users"],
        "roles": ["admin"],
    },
    {
        "name": "Admin Manage Opportunities",
        "path": "admin-manage-opportunities.html",
        "description": "Admin-only page for reviewing and removing opportunities posted by people in the admin's organisation.",
        "keywords": ["manage opportunities", "admin opportunities", "remove opportunity"],
        "actions": ["Open admin manage opportunities"],
        "roles": ["admin"],
    },
    {
        "name": "Admin System Settings",
        "path": "admin-system-settings.html",
        "description": "Admin-only configuration page for global platform settings and operational controls.",
        "keywords": ["system settings", "platform configuration", "maintenance mode", "admin settings"],
        "actions": ["Open admin system settings"],
        "roles": ["admin"],
    },
    {
        "name": "Admin Profile",
        "path": "admin-user-profile.html",
        "description": "Admin profile page with backend-loaded admin details, organisation-scoped governance metrics, system logs link, and logout.",
        "keywords": ["admin profile", "logout", "system logs", "admin user profile"],
        "actions": ["Open admin profile"],
        "roles": ["admin"],
    },
]


ROLE_CAPABILITIES: Dict[str, List[str]] = {
    "contributors": [
        "browse opportunities",
        "mark interest",
        "apply to opportunities",
        "post opportunities",
        "review applicants on own posted opportunities",
        "track rewards and points",
        "use community channels and messages",
        "manage profile skills and preferences",
    ],
    "user": [
        "browse opportunities",
        "mark interest",
        "apply to opportunities",
        "post opportunities",
        "review applicants on own posted opportunities",
        "track rewards and points",
        "use community channels and messages",
        "manage profile skills and preferences",
    ],
    "admin": [
        "browse and post opportunities",
        "manage users and roles within their organisation",
        "review reward policy",
        "manage opportunities within their organisation",
        "access system settings",
        "view organisation-scoped dashboard and notifications",
        "use community and dashboard features",
    ],
    "head_of_department": [
        "browse opportunities",
        "track rewards and platform activity",
        "participate in community features",
    ],
}


SAFE_ACTIONS = [
    "Open home page",
    "Open opportunities page",
    "Browse opportunities",
    "Open add opportunity page",
    "Review expectations before applying",
    "Update your profile",
    "Refresh AI matches",
    "Open dashboard",
    "Check reward policy",
    "Open community page",
    "Join an active channel",
    "Ask about recommended opportunities",
    "Ask about rewards",
    "Ask how to use community chat",
    "Open posted opportunities page",
    "Open appointment page",
    "Open login page",
    "Open contributor signup",
    "Open admin signup",
    "Open admin home",
    "Open admin manage users",
    "Open admin manage opportunities",
    "Open admin system settings",
    "Open admin profile",
]


def get_page_sources() -> List[str]:
    return [f"Page: {page['name']}" for page in PAGES]


def get_relevant_pages(message: str, role: str) -> List[Dict[str, object]]:
    prompt = message.lower()
    relevant = []
    for page in PAGES:
        allowed_roles = page.get("roles")
        if allowed_roles and role not in allowed_roles:
            continue
        if any(keyword in prompt for keyword in page["keywords"]):
            relevant.append(page)

    if not relevant and any(keyword in prompt for keyword in ["platform", "how does this work", "what can i do", "navigation"]):
        # Provide a broad starter set if the user asks for general platform guidance.
        relevant = [page for page in PAGES if not page.get("roles")][:5]

    return relevant[:4]


def build_platform_context(message: str, role: str) -> str:
    pages = get_relevant_pages(message, role)
    page_lines = "\n".join(
        [f"- {page['name']} ({page['path']}): {page['description']}" for page in pages]
    ) or "- No specific page match identified"

    capabilities = ROLE_CAPABILITIES.get(role, ROLE_CAPABILITIES["contributors"])
    capability_lines = "\n".join([f"- {capability}" for capability in capabilities])

    return (
        f"Platform Overview:\n- {PLATFORM_OVERVIEW}\n\n"
        f"Relevant Pages:\n{page_lines}\n\n"
        f"Role Capabilities for {role}:\n{capability_lines}\n"
    )


def answer_navigation_question(message: str, role: str) -> tuple[str, List[str], List[str]] | None:
    prompt = message.lower()
    pages = get_relevant_pages(message, role)
    if not pages:
        return None

    primary = pages[0]
    sources = [f"Page: {page['name']}" for page in pages]
    actions = [action for action in primary.get("actions", []) if action in SAFE_ACTIONS][:2]

    if any(keyword in prompt for keyword in ["where", "how do i", "how can i", "go to", "find", "browse", "use"]):
        reply = f"For that, use the {primary['name']} page. {primary['description']}"
        return reply, sources, actions or ["Browse opportunities"]

    if any(keyword in prompt for keyword in ["platform", "work", "what can i do"]):
        reply = f"{PLATFORM_OVERVIEW} A key area for this is the {primary['name']} page."
        return reply, sources, actions or ["Browse opportunities"]

    return None


def get_allowed_actions() -> List[str]:
    return SAFE_ACTIONS[:]
