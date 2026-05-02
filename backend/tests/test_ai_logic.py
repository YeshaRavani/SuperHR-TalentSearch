from backend.services.ai_logic import answer_platform_question, build_personalized_suggestions, get_ranked_matches


class DummyUser:
    def __init__(self):
        self.role = "contributors"
        self.organisation = "Plaksha University"
        self.department_team = "Product Innovation Lab, Python"
        self.total_points = 40


class DummyOpportunity:
    def __init__(self, title, expectations, full_description="", short_description="", location="Remote", status="active"):
        self.title = title
        self.expectations = expectations
        self.full_description = full_description
        self.short_description = short_description
        self.location = location
        self.status = status
        self.created_at = "2026-01-01T00:00:00"


def test_match_ranking_prioritizes_relevant_opportunities():
    user = DummyUser()
    opportunities = [
        DummyOpportunity("UX Research Sprint", "Design interviews and synthesis"),
        DummyOpportunity("Python Automation Project", "Python automation and API integrations"),
    ]

    matches = get_ranked_matches(user, opportunities)

    assert matches
    assert matches[0].title == "Python Automation Project"


def test_suggestions_include_profile_context():
    user = DummyUser()
    suggestions = build_personalized_suggestions(user, [])

    assert any("Product Innovation Lab" in suggestion for suggestion in suggestions)


def test_chat_recommendations_include_actions():
    user = DummyUser()
    opportunities = [DummyOpportunity("Backend API Development", "Python and REST APIs")]

    reply, sources, actions = answer_platform_question("Recommend opportunities for me", user, opportunities)

    assert "Backend API Development" in reply
    assert sources
    assert actions


def test_navigation_question_points_to_opportunities_page():
    user = DummyUser()

    reply, sources, actions = answer_platform_question("Where do I browse opportunities?", user, [])

    assert "Opportunities" in reply
    assert any("Page: Opportunities" == source for source in sources)
    assert actions


def test_platform_overview_mentions_core_areas():
    user = DummyUser()

    reply, sources, actions = answer_platform_question("How does this platform work?", user, [])

    assert "opportunities" in reply.lower()
    assert "community" in reply.lower() or "profile" in reply.lower()
    assert sources
    assert actions


def test_platform_troubleshooting_gives_visibility_advice():
    user = DummyUser()

    reply, sources, actions = answer_platform_question("I am not getting any enrollments", user, [])

    assert "profile" in reply.lower() or "skills" in reply.lower()
    assert any(source == "Page: Profile" for source in sources)
    assert actions


def test_appreciation_reply_stays_natural():
    user = DummyUser()

    reply, sources, actions = answer_platform_question("nice I like the platform", user, [])

    assert "glad" in reply.lower() or "hear" in reply.lower()
    assert not sources
    assert not actions


def test_emotional_message_gets_empathy_first():
    user = DummyUser()

    reply, sources, actions = answer_platform_question("i am depressed", user, [])

    assert "sorry" in reply.lower() or "support" in reply.lower()
    assert not sources
    assert not actions
