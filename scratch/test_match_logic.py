import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services.ai_logic import score_opportunity_match
from backend import orm_models

class MockSkill:
    def __init__(self, name):
        self.name = name

class MockUser:
    def __init__(self, skills, department_team="Product Innovation Lab"):
        self.skills = [MockSkill(s) for s in skills]
        self.department_team = department_team
        self.organisation = "Talent Search"

class MockOpportunity:
    def __init__(self, title, skills, description):
        self.id = "test-id"
        self.title = title
        self.skills = [MockSkill(s) for s in skills]
        self.short_description = description
        self.full_description = description
        self.expectations = description
        self.status = "active"

def test_match():
    # User skills from screenshot: Python, Automation, Workflow Optimization, APIs
    user = MockUser(["Python", "Automation", "Workflow Optimization", "APIs"])
    
    # Opportunity from screenshot: Front End Developer for Community Garden Project
    opp = MockOpportunity(
        "Front End Developer for Community Garden Project",
        ["Web Development", "Front End Development"],
        "We are seeking a motivated student to help build the front end for our new community garden project. The ideal candidate will have experience with web development and be able to work independently."
    )
    
    score = score_opportunity_match(user, opp)
    print(f"\nMatch Score for Rushil: {score}%")
    
    if score <= 15:
        print("FAILED: Score is too low!")
    elif score >= 35:
        print("PASSED: Score reflects technical relevance or floor.")
    else:
        print(f"STILL LOW: Score is {score}%, needs more semantic boost.")

if __name__ == "__main__":
    test_match()
