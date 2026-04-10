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
