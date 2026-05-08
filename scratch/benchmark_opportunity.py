import os
import json
import time
from typing import List, Dict
import requests

# Groq API Configuration
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def call_groq(prompt: str, system_prompt: str = None, model: str = "llama-3.1-8b-instant", temperature: float = 0.0) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    data = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }
    response = requests.post(GROQ_URL, headers=headers, json=data)
    time.sleep(1.0) # Rate limit protection
    if response.status_code != 200:
        raise Exception(f"Groq API Error: {response.text}")
    return response.json()["choices"][0]["message"]["content"]

# --- FULL 20 OPPORTUNITY DATASET ---
dataset = [
    {
        "id": 1, "industry": "Software Dev",
        "input": "Hey we need a Python dev for the next two weeks to build an API. Remote work, probably 5 to 10 hours a week. Will give 200 points for it. Looking for someone with Fast API experience.",
        "ground_truth": {
            "title": "Python API Developer", "type": "Opportunity", "location": "Remote", 
            "description": "Build an API using FastAPI.", "schedule": "Next 2 weeks", 
            "bounty": 200, "time_commitment": "5-10 hours / week", "skills": ["Python", "FastAPI"]
        }
    },
    {
        "id": 2, "industry": "Design",
        "input": "Looking for a graphic designer to make a logo for our new project. Need it done by this Friday. We're based in New York but remote is fine. Offering 150 points. Takes less than an hour.",
        "ground_truth": {
            "title": "Graphic Designer for Logo", "type": "Opportunity", "location": "Remote", 
            "description": "Create a logo for a new project.", "schedule": "By this Friday", 
            "bounty": 150, "time_commitment": "Less than 1 hour", "skills": ["Design"]
        }
    },
    {
        "id": 3, "industry": "Marketing",
        "input": "We need help running our social media for the next month. Every Monday and Wednesday. Just basic posting and engaging. It's a remote gig. I can do 300 points. Expect 3 to 5 hours a week.",
        "ground_truth": {
            "title": "Social Media Manager", "type": "Opportunity", "location": "Remote", 
            "description": "Run social media, post and engage.", "schedule": "Every Monday and Wednesday", 
            "bounty": 300, "time_commitment": "3-5 hours / week", "skills": ["Social Media", "Marketing"]
        }
    },
    {
        "id": 4, "industry": "Writing",
        "input": "Looking for a content writer to write a blog post about AI in healthcare. 500 words. Need it by tomorrow. Remote. Offering 100 points. Probably 1 to 2 hours of work.",
        "ground_truth": {
            "title": "Content Writer for AI Blog", "type": "Opportunity", "location": "Remote", 
            "description": "Write a 500-word blog post about AI in healthcare.", "schedule": "Tomorrow", 
            "bounty": 100, "time_commitment": "1-2 hours / week", "skills": ["Writing"]
        }
    },
    {
        "id": 5, "industry": "Video Editing",
        "input": "Hey, looking for someone to edit a short promo video. Raw footage is ready. Deadline is next week. Should take less than 1 hour. Remote. 150 points reward.",
        "ground_truth": {
            "title": "Promo Video Editor", "type": "Opportunity", "location": "Remote", 
            "description": "Edit a short promo video from raw footage.", "schedule": "Next week", 
            "bounty": 150, "time_commitment": "Less than 1 hour", "skills": ["Video Editing"]
        }
    },
    {
        "id": 6, "industry": "Data Analysis",
        "input": "Need a data analyst to clean up a spreadsheet and make some charts. Remote work. Next 2 weeks. Offering 250 points. About 3-5 hours per week. Must know Excel.",
        "ground_truth": {
            "title": "Data Analyst for Spreadsheets", "type": "Opportunity", "location": "Remote", 
            "description": "Clean up a spreadsheet and create charts.", "schedule": "Next 2 weeks", 
            "bounty": 250, "time_commitment": "3-5 hours / week", "skills": ["Data Analysis", "Excel"]
        }
    },
    {
        "id": 7, "industry": "Event Planning",
        "input": "Need an event coordinator for an in-person meetup in London next Saturday. On-site required. Offering 400 points. Expect 5-10 hours this week preparing.",
        "ground_truth": {
            "title": "Event Coordinator for Meetup", "type": "Opportunity", "location": "London", 
            "description": "Coordinate an in-person meetup.", "schedule": "Next Saturday", 
            "bounty": 400, "time_commitment": "5-10 hours / week", "skills": ["Event Management", "Coordination"]
        }
    },
    {
        "id": 8, "industry": "Research",
        "input": "Looking for a researcher to find 50 contact leads for our sales team. Remote. 100 points. Need it by Monday. 1-2 hours of work max.",
        "ground_truth": {
            "title": "Lead Generation Researcher", "type": "Opportunity", "location": "Remote", 
            "description": "Find 50 contact leads for the sales team.", "schedule": "By Monday", 
            "bounty": 100, "time_commitment": "1-2 hours / week", "skills": ["Research"]
        }
    },
    {
        "id": 9, "industry": "Public Speaking",
        "input": "Seeking a guest speaker for our online webinar this Friday on leadership. Remote via Zoom. 500 points. Less than 1 hour time commitment.",
        "ground_truth": {
            "title": "Guest Speaker on Leadership", "type": "Opportunity", "location": "Remote", 
            "description": "Speak at an online webinar about leadership.", "schedule": "This Friday", 
            "bounty": 500, "time_commitment": "Less than 1 hour", "skills": ["Public Speaking", "Leadership"]
        }
    },
    {
        "id": 10, "industry": "Frontend Dev",
        "input": "Need a React developer to fix some UI bugs on our homepage. Remote. Next week. 200 points. Should take 3-5 hours.",
        "ground_truth": {
            "title": "React UI Bug Fixer", "type": "Opportunity", "location": "Remote", 
            "description": "Fix UI bugs on the homepage.", "schedule": "Next week", 
            "bounty": 200, "time_commitment": "3-5 hours / week", "skills": ["React", "JavaScript", "CSS"]
        }
    },
    {
        "id": 11, "industry": "Photography",
        "input": "Looking for a photographer in San Francisco for a corporate event next Thursday. 5-10 hours of work. Paying 600 points. In-person obviously.",
        "ground_truth": {
            "title": "Corporate Event Photographer", "type": "Opportunity", "location": "San Francisco", 
            "description": "Photograph a corporate event.", "schedule": "Next Thursday", 
            "bounty": 600, "time_commitment": "5-10 hours / week", "skills": ["Photography"]
        }
    },
    {
        "id": 12, "industry": "Database",
        "input": "Need SQL expert to optimize some slow queries. Remote. ASAP. Offering 300 points. Time commitment 1-2 hours.",
        "ground_truth": {
            "title": "SQL Query Optimization", "type": "Opportunity", "location": "Remote", 
            "description": "Optimize slow database queries.", "schedule": "ASAP", 
            "bounty": 300, "time_commitment": "1-2 hours / week", "skills": ["SQL"]
        }
    },
    {
        "id": 13, "industry": "Machine Learning",
        "input": "Need help training a basic classification model in Python. Remote. Next 2 weeks. 400 points. 5-10 hours per week. Must know Scikit-Learn.",
        "ground_truth": {
            "title": "Machine Learning Model Trainer", "type": "Opportunity", "location": "Remote", 
            "description": "Train a basic classification model.", "schedule": "Next 2 weeks", 
            "bounty": 400, "time_commitment": "5-10 hours / week", "skills": ["Python", "Machine Learning"]
        }
    },
    {
        "id": 14, "industry": "Project Management",
        "input": "Looking for a project manager to help organize our Trello board and set up agile sprints. Remote, 3-5 hours a week for the next month. 250 points.",
        "ground_truth": {
            "title": "Agile Project Manager", "type": "Opportunity", "location": "Remote", 
            "description": "Organize Trello board and set up agile sprints.", "schedule": "Next month", 
            "bounty": 250, "time_commitment": "3-5 hours / week", "skills": ["Project Management", "Coordination"]
        }
    },
    {
        "id": 15, "industry": "UI Design",
        "input": "Need someone to make a Figma prototype for an app idea. Remote. 350 points. Expect 5-10 hours of work. Deadline is end of the month.",
        "ground_truth": {
            "title": "Figma App Prototyper", "type": "Opportunity", "location": "Remote", 
            "description": "Create a Figma prototype for a new app idea.", "schedule": "End of the month", 
            "bounty": 350, "time_commitment": "5-10 hours / week", "skills": ["Figma", "Design"]
        }
    },
    {
        "id": 16, "industry": "Writing",
        "input": "Need a proofreader for a 10 page document. Remote. 100 points. Need it by tomorrow night. Less than 1 hour.",
        "ground_truth": {
            "title": "Document Proofreader", "type": "Opportunity", "location": "Remote", 
            "description": "Proofread a 10-page document.", "schedule": "Tomorrow night", 
            "bounty": 100, "time_commitment": "Less than 1 hour", "skills": ["Writing"]
        }
    },
    {
        "id": 17, "industry": "Presentation",
        "input": "Can someone help me design a Canva presentation for my pitch? Remote, by Wednesday. 1-2 hours of work. 150 points.",
        "ground_truth": {
            "title": "Canva Presentation Designer", "type": "Opportunity", "location": "Remote", 
            "description": "Design a pitch presentation using Canva.", "schedule": "By Wednesday", 
            "bounty": 150, "time_commitment": "1-2 hours / week", "skills": ["Canva", "Design"]
        }
    },
    {
        "id": 18, "industry": "Community",
        "input": "Looking for a moderator for our Discord community. Remote. 200 points. 3-5 hours a week for the next 3 weeks.",
        "ground_truth": {
            "title": "Discord Community Moderator", "type": "Opportunity", "location": "Remote", 
            "description": "Moderate the Discord community.", "schedule": "Next 3 weeks", 
            "bounty": 200, "time_commitment": "3-5 hours / week", "skills": ["Communication", "Coordination"]
        }
    },
    {
        "id": 19, "industry": "Marketing",
        "input": "Need an SEO specialist to audit our website. Remote, 300 points. Next week. Should take 1-2 hours.",
        "ground_truth": {
            "title": "SEO Website Auditor", "type": "Opportunity", "location": "Remote", 
            "description": "Perform an SEO audit on the website.", "schedule": "Next week", 
            "bounty": 300, "time_commitment": "1-2 hours / week", "skills": ["Marketing"]
        }
    },
    {
        "id": 20, "industry": "Customer Support",
        "input": "Need someone to reply to customer emails. Remote. 5-10 hours a week for the next month. 400 points.",
        "ground_truth": {
            "title": "Customer Email Support", "type": "Opportunity", "location": "Remote", 
            "description": "Reply to customer support emails.", "schedule": "Next month", 
            "bounty": 400, "time_commitment": "5-10 hours / week", "skills": ["Communication"]
        }
    }
]

# --- BASELINES ---
def clean_json(text: str) -> str:
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text

def single_prompt_extraction(text: str) -> dict:
    prompt = f"Extract opportunity details from this spoken text. Return ONLY a JSON object with keys: title, type (always 'Opportunity'), location, description, schedule, bounty (int), time_commitment (e.g. '1-2 hours / week'), skills (list of strings). Text: {text}"
    output = call_groq(prompt)
    try:
        cleaned = clean_json(output)
        return json.loads(cleaned)
    except: return {"raw": output}

def agentic_extraction(text: str) -> dict:
    sys_prompt = (
        "You are an AI assistant helping a recruiter create an opportunity post. "
        "From the provided natural language description, extract and structure the details into a JSON object. "
        "Fields to extract:\n"
        "1. title: A catchy and professional title.\n"
        "2. type: Always use 'Opportunity'.\n"
        "3. location: Specific venue or 'Remote'.\n"
        "4. description: A clear, multi-sentence professional description.\n"
        "5. schedule: Timeline or date info (e.g. 'Next 2 weeks', 'Every Monday').\n"
        "6. bounty: Integer value representing XP points reward. Default to 100 if not clear.\n"
        "7. time_commitment: Choose the closest match from: 'Less than 1 hour', '1-2 hours / week', '3-5 hours / week', '5-10 hours / week'.\n"
        "8. skills: List of relevant professional skills required.\n"
        "Return ONLY the JSON object matching the requested schema."
    )
    s1 = call_groq(text, system_prompt=sys_prompt)
    
    # Agentic reflection step
    review_prompt = f"Review the following JSON extracted from a spoken ad. Ensure all fields (title, type, location, description, schedule, bounty as int, time_commitment, skills as list) are present and properly formatted. Fix any missing values with sensible defaults (like 100 for bounty, 'Remote' for location, 'TBD' for schedule). Original text: '{text}'. Extracted JSON: {s1}. Return ONLY the corrected JSON."
    s2 = call_groq(review_prompt, model="llama-3.3-70b-versatile")
    try:
        cleaned = clean_json(s2)
        return json.loads(cleaned)
    except: return {"raw": s2}

def evaluate_output(gt: dict, extracted: dict) -> Dict:
    prompt = f"Judge the 'Extracted' JSON against the 'Ground Truth' JSON for an opportunity posting. \nExtracted: {extracted}\nGround Truth: {gt}\nRate 1-5 (5 is perfect match for semantic intent, even if words differ slightly) and provide ONLY JSON: {{\"score\": int, \"reasoning\": str}}"
    output = call_groq(prompt, model="llama-3.3-70b-versatile")
    try:
        cleaned = clean_json(output)
        return json.loads(cleaned)
    except: 
        print(f"DEBUG: Failed to parse Judge output: {output}")
        return {"score": 3, "reasoning": "Parse failed"}

# --- RUN ---
results = []
print(f"Starting 20-Opportunity Benchmark...")
for entry in dataset:
    print(f"Processing ID {entry['id']}...")
    s_out = single_prompt_extraction(entry['input'])
    s_eval = evaluate_output(entry['ground_truth'], s_out)
    a_out = agentic_extraction(entry['input'])
    a_eval = evaluate_output(entry['ground_truth'], a_out)
    results.append({
        "id": entry['id'], 
        "industry": entry['industry'], 
        "input": entry['input'], 
        "ground_truth": entry['ground_truth'], 
        "single": {"score": s_eval['score'], "reasoning": s_eval['reasoning'], "output": s_out}, 
        "agentic": {"score": a_eval['score'], "reasoning": a_eval['reasoning'], "output": a_out}
    })

with open("BENCHMARK_OPP_RESULTS.json", "w") as f:
    json.dump(results, f, indent=4)

print("20-Opportunity Benchmark Complete.")
