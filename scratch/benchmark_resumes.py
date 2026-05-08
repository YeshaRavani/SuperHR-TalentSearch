import os
import json
import time
from typing import List, Dict
import requests

# Groq API Configuration
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def call_groq(prompt: str, model: str = "llama-3.1-8b-instant", temperature: float = 0.0) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature
    }
    response = requests.post(GROQ_URL, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Groq API Error: {response.text}")
    return response.json()["choices"][0]["message"]["content"]

# --- DATASET (Input & Ground Truth) ---
dataset = [
    {
        "id": 1,
        "industry": "Software Engineering",
        "input": """
        Alex Rivers
        Full Stack Engineer with 4 years of experience.
        Proficient in Python, Django, and PostgreSQL. 
        Highly skilled in frontend development using React and Redux.
        Familiar with AWS (EC2, S3) and Docker for deployment.
        Experience with CI/CD pipelines using GitHub Actions.
        """,
        "ground_truth": ["Python", "Django", "PostgreSQL", "React", "Redux", "AWS", "EC2", "S3", "Docker", "CI/CD", "GitHub Actions"]
    },
    {
        "id": 2,
        "industry": "Data Science",
        "input": """
        Jordan Smith
        Data Scientist focused on Machine Learning and NLP.
        Expert in Python (Pandas, NumPy, Scikit-learn).
        Experience building LLM applications using LangChain and OpenAI API.
        Database management with MongoDB and SQL.
        Visualizations created in Tableau and Matplotlib.
        """,
        "ground_truth": ["Python", "Machine Learning", "NLP", "Pandas", "NumPy", "Scikit-learn", "LLM", "LangChain", "OpenAI API", "MongoDB", "SQL", "Tableau", "Matplotlib"]
    },
    {
        "id": 3,
        "industry": "Design",
        "input": """
        Casey Lane
        UI/UX Designer with a passion for user-centric interfaces.
        Expert in Figma, Adobe XD, and Photoshop.
        Strong understanding of HTML/CSS for prototyping.
        Experience with Design Systems and Accessibility (WCAG).
        """,
        "ground_truth": ["UI/UX Design", "Figma", "Adobe XD", "Photoshop", "HTML", "CSS", "Design Systems", "Accessibility", "WCAG"]
    }
]

# --- BASELINE 1: SINGLE PROMPT ---
def single_prompt_extraction(text: str) -> List[str]:
    prompt = f"""
    Extract all technical skills and tools mentioned in the following resume text.
    Return ONLY a JSON list of strings.
    
    Resume Text:
    {text}
    """
    output = call_groq(prompt)
    try:
        # Clean potential markdown
        cleaned = output.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except:
        return [output]

# --- BASELINE 2: AGENTIC BASELINE (REFLECTIVE AGENT) ---
def agentic_extraction(text: str) -> List[str]:
    # Step 1: Initial Extraction
    step1_prompt = f"Extract all technical skills from this resume. Text: {text}"
    initial_skills = call_groq(step1_prompt)
    
    # Step 2: Reflection & Self-Correction
    step2_prompt = f"""
    You are a meticulous auditor. 
    Review the following resume text and the list of skills already extracted.
    Identify any technical skills, tools, or frameworks that were missed.
    
    Resume Text:
    {text}
    
    Initial Skills:
    {initial_skills}
    
    Return a consolidated, final list of ALL skills as a JSON list.
    """
    final_output = call_groq(step2_prompt, model="llama-3.3-70b-versatile")
    try:
        cleaned = final_output.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except:
        return [final_output]

# --- JUDGE: LLM AS A JUDGE ---
def evaluate_output(ground_truth: List[str], extracted: List[str]) -> Dict:
    prompt = f"""
    You are an expert AI Evaluator. 
    Compare the following 'Extracted Skills' against the 'Ground Truth Skills'.
    
    Ground Truth: {ground_truth}
    Extracted: {extracted}
    
    Rate the extraction on a scale of 1 to 5:
    5: Perfect match, all skills found, no extras.
    4: Most skills found, minor omissions.
    3: Major skills found but missed several tools or frameworks.
    2: Missed half or more of the skills.
    1: Completely wrong or hallucinated.
    
    Provide your response as JSON:
    {{
        "score": (int),
        "reasoning": (string),
        "missing_skills": (list),
        "hallucinations": (list)
    }}
    """
    output = call_groq(prompt, model="llama-3.3-70b-versatile")
    try:
        cleaned = output.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except:
        return {"error": "Evaluation failed", "raw": output}

# --- RUN BENCHMARK ---
results = []
print("Starting Benchmark...")

for entry in dataset:
    print(f"Processing ID {entry['id']} ({entry['industry']})...")
    
    # Single Prompt
    t0 = time.time()
    single_out = single_prompt_extraction(entry['input'])
    single_time = time.time() - t0
    single_eval = evaluate_output(entry['ground_truth'], single_out)
    
    # Agentic
    t0 = time.time()
    agentic_out = agentic_extraction(entry['input'])
    agentic_time = time.time() - t0
    agentic_eval = evaluate_output(entry['ground_truth'], agentic_out)
    
    results.append({
        "id": entry['id'],
        "industry": entry['industry'],
        "input": entry['input'],
        "ground_truth": entry['ground_truth'],
        "baselines": {
            "single_prompt": {
                "output": single_out,
                "latency": round(single_time, 2),
                "eval": single_eval
            },
            "agentic": {
                "output": agentic_out,
                "latency": round(agentic_time, 2),
                "eval": agentic_eval
            }
        }
    })

# Save results
with open("BENCHMARK_RESULTS.json", "w") as f:
    json.dump(results, f, indent=4)

print("Benchmark Complete. Results saved to BENCHMARK_RESULTS.json")
