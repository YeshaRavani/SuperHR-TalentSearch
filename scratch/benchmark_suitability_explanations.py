import os
import json
import sys
import time
from typing import List, Dict

# Setup path to import backend
sys.path.append(os.path.abspath("."))

from backend.services.ai_logic import score_opportunity_match

# Groq API Configuration
import requests
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
# Using 8b for everything but with MUCH LONGER sleeps to ensure TPM/RPM success
MODEL = "llama-3.1-8b-instant"

def call_groq(prompt: str, system_prompt: str = "You are a recruitment AI.") -> str:
    for attempt in range(5):
        try:
            headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
            data = {
                "model": MODEL,
                "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
                "temperature": 0.0
            }
            response = requests.post(GROQ_URL, headers=headers, json=data, timeout=20)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            time.sleep(5)
        except:
            time.sleep(5)
    return ""

def clean_json(text: str) -> dict:
    try:
        start = text.find('{')
        end = text.rfind('}')
        if start == -1: return {}
        return json.loads(text[start:end+1])
    except:
        return {}

def agentic_explanation(user, opp):
    s1_data = score_opportunity_match(user, opp, skip_ai=False)
    exp = s1_data['reasoning']
    time.sleep(15) # Wait between implementation and reflection
    p = f"Critically review: \"{exp}\". User skills: {[s.name for s in user.skills]} vs Job: {opp.title}. Fix any domain errors or generic tone. Return JSON: {{\"reasoning\": \"<string>\"}}"
    res = clean_json(call_groq(p, "You are a skeptical auditor."))
    return res.get('reasoning', exp)

# --- DATASET ---
eval_dataset = [
    {"id": 1, "scenario": "Technical Depth", "user": {"skills": ["Python", "Docker", "AWS"], "team": "DevOps"}, "opp": {"title": "Cloud Infrastructure Engineer", "skills": ["AWS", "Terraform"], "desc": "Scale our cloud clusters."}, "gt": "Strong AWS fit, slight gap in Terraform."},
    {"id": 2, "scenario": "Cross-Functional Design", "user": {"skills": ["Figma", "UX"], "team": "Design"}, "opp": {"title": "Product Architect", "skills": ["User Research", "Figma"], "desc": "Design mobile apps."}, "gt": "Excellent design alignment and Figma expertise."},
    {"id": 3, "scenario": "Industry Pivot (Healthcare)", "user": {"skills": ["Nurse", "Patient Care"], "team": "Medical"}, "opp": {"title": "Healthcare Consultant", "skills": ["Medical Knowledge"], "desc": "Build workflow apps."}, "gt": "Deep domain expertise for medical workflows."},
    {"id": 4, "scenario": "Developer to Lead", "user": {"skills": ["Java", "Spring"], "team": "Eng"}, "opp": {"title": "Team Lead", "skills": ["Leadership", "Java"], "desc": "Lead 5 devs."}, "gt": "Solid tech base but lacks leadership evidence."},
    {"id": 5, "scenario": "Data Analytics", "user": {"skills": ["SQL", "Tableau"], "team": "Mkt"}, "opp": {"title": "Growth Analyst", "skills": ["Python", "SQL"], "desc": "Analyze campaigns."}, "gt": "SQL and Mkt context are strong; Python is a gap."},
    {"id": 6, "scenario": "Semantic Tools (NLP)", "user": {"skills": ["NLP", "Transformers"], "team": "AI"}, "opp": {"title": "LLM Engineer", "skills": ["LLMs"], "desc": "Fine-tune models."}, "gt": "Perfect semantic fit for model engineering."},
    {"id": 7, "scenario": "Domain Mismatch (Route)", "user": {"skills": ["Route Planning"], "team": "Logistics"}, "opp": {"title": "Network Router Spec", "skills": ["Cisco"], "desc": "Optimize data flow."}, "gt": "Poor match; Logistics route planning is not IT routing."},
    {"id": 8, "scenario": "Creative Crossover", "user": {"skills": ["Copywriting"], "team": "Content"}, "opp": {"title": "UX Writer", "skills": ["Communication"], "desc": "Craft UI microcopy."}, "gt": "Natural transition into UX writing."},
    {"id": 9, "scenario": "Automation/QA", "user": {"skills": ["Selenium", "Python"], "team": "QA"}, "opp": {"title": "Automation Engineer", "skills": ["Python"], "desc": "Automate pipelines."}, "gt": "Excellent fit for Python automation tasks."},
    {"id": 10, "scenario": "Marketing/Discord", "user": {"skills": ["Social Media"], "team": "Mkt"}, "opp": {"title": "Community Manager", "skills": ["Discord"], "desc": "Grow community."}, "gt": "Strong engagement alignment."},
    {"id": 11, "scenario": "Finance/CPA", "user": {"skills": ["CPA"], "team": "Finance"}, "opp": {"title": "Analyst", "skills": ["Budgeting"], "desc": "Plan budgets."}, "gt": "Highly suited Finance background."},
    {"id": 12, "scenario": "Support to Sales", "user": {"skills": ["Customer Support"], "team": "Support"}, "opp": {"title": "Tech Sales", "skills": ["Communication"], "desc": "Pitch products."}, "gt": "Product knowledge is good for technical pitching."},
    {"id": 13, "scenario": "Research", "user": {"skills": ["Scientific Research"], "team": "Science"}, "opp": {"title": "Market Researcher", "skills": ["Research"], "desc": "Gather insights."}, "gt": "Research methodology translates well."},
    {"id": 14, "scenario": "Frontend Pivot", "user": {"skills": ["HTML", "CSS"], "team": "Eng"}, "opp": {"title": "React Dev", "skills": ["React"], "desc": "Modernize frontend."}, "gt": "Partial match; lacks React specific experience."},
    {"id": 15, "scenario": "Agile/Scrum", "user": {"skills": ["Scrum Master"], "team": "Ops"}, "opp": {"title": "Coordinator", "skills": ["Planning"], "desc": "Coordinate teams."}, "gt": "Perfect fit for team coordination."},
    {"id": 16, "scenario": "Hardware/Arduino", "user": {"skills": ["Arduino"], "team": "Hardware"}, "opp": {"title": "Embedded Eng", "skills": ["C"], "desc": "IoT sensors."}, "gt": "Good hardware base but needs deeper C coding."},
    {"id": 17, "scenario": "Legal/GDPR", "user": {"skills": ["Corporate Law"], "team": "Legal"}, "opp": {"title": "GDPR Officer", "skills": ["Privacy"], "desc": "Global standards."}, "gt": "Critical legal foundation for compliance."},
    {"id": 18, "scenario": "Video Editor", "user": {"skills": ["Adobe Premiere"], "team": "Media"}, "opp": {"title": "Content Creator", "skills": ["Editing"], "desc": "Social clips."}, "gt": "Direct video editing skill translation."},
    {"id": 19, "scenario": "HR/People", "user": {"skills": ["Recruitment"], "team": "People"}, "opp": {"title": "Experience Lead", "skills": ["Onboarding"], "desc": "Improve journeys."}, "gt": "Strong insight into hire-to-onboard flow."},
    {"id": 20, "scenario": "Security/IT", "user": {"skills": ["PenTesting"], "team": "Security"}, "opp": {"title": "IT Support", "skills": ["Networking"], "desc": "Manage servers."}, "gt": "Excellent security expertise for server management."}
]

def run_benchmark():
    results = []
    print(f"Starting Final Comparative Suitability Evaluation (Slow Run for Rate Limits)...")
    for case in eval_dataset:
        print(f"Processing ID {case['id']}...")
        u = type('U', (object,), {'username': 'u', 'full_name': 'u', 'department_team': case['user']['team'], 'skills': [type('S', (object,), {'name': s}) for s in case['user']['skills']]})
        o = type('O', (object,), {'title': case['opp']['title'], 'full_description': case['opp']['desc'], 'expectations': '', 'short_description': case['opp']['desc'], 'skills': [type('S', (object,), {'name': s}) for s in case['opp']['skills']]})
        
        # 1. Single
        s_data = score_opportunity_match(u, o, skip_ai=False)
        s_exp = s_data['reasoning']
        time.sleep(15) 

        # 2. Agentic
        a_exp = agentic_explanation(u, o)
        time.sleep(15)

        def judge(exp):
            p = f"Judge AI Explanation Quality. Scenario: {case['scenario']}. Expected: {case['gt']}. AI Output: \"{exp}\". Rate 1-10 Accuracy. Return JSON: {{\"grade\": int}}"
            res = clean_json(call_groq(p, "You are a senior judge."))
            return res.get('grade', 0)
        
        s_grade = judge(s_exp)
        time.sleep(15)
        a_grade = judge(a_exp)
        
        results.append({
            "id": case['id'], "scenario": case['scenario'], "user": case['user'], "opp": case['opp'], "gt": case['gt'],
            "single": {"exp": s_exp, "grade": s_grade},
            "agentic": {"exp": a_exp, "grade": a_grade}
        })
        print(f"  ID {case['id']} Finished. S: {s_grade}, A: {a_grade}")
        time.sleep(15) # Wait between scenarios

    avg_s = sum(r['single']['grade'] for r in results) / 20
    avg_a = sum(r['agentic']['grade'] for r in results) / 20
    
    with open("SUITABILITY_AI_EVALUATION.txt", "w") as f:
        f.write("# AI Suitability Explanation Evaluation: Single vs. Agentic\n\n")
        f.write(f"Average Single AI Grade: {avg_s:.2f}/10\n")
        f.write(f"Average Agentic AI Grade: {avg_a:.2f}/10\n\n")
        f.write("## 1. Comparative Results Table\n\n")
        f.write("| ID | Scenario | Single AI Reasoning | S-Grade | Agentic AI (Reflected) Reasoning | A-Grade |\n")
        f.write("| :--- | :--- | :--- | :---: | :--- | :---: |\n")
        for r in results:
            f.write(f"| {r['id']} | {r['scenario']} | {r['single']['exp']} | {r['single']['grade']} | {r['agentic']['exp']} | {r['agentic']['grade']} |\n")
            
        f.write("\n\n## 2. Detailed Ground Truths & Inputs\n")
        for r in results:
            f.write(f"\n### Case {r['id']}: {r['scenario']}\n")
            f.write(f"- **User Skills**: {r['user']['skills']}\n")
            f.write(f"- **User Team**: {r['user']['team']}\n")
            f.write(f"- **Opportunity**: {r['opp']['title']}\n")
            f.write(f"- **Ground Truth Expectation**: {r['gt']}\n")

if __name__ == "__main__":
    run_benchmark()
