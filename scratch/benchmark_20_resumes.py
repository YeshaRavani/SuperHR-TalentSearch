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
    time.sleep(1.0) # Rate limit protection
    if response.status_code != 200:
        raise Exception(f"Groq API Error: {response.text}")
    return response.json()["choices"][0]["message"]["content"]

# --- FULL 20-RESUME DATASET ---
dataset = [
    {
        "id": 1, "industry": "Software Engineering",
        "input": "Alex Rivers. Full Stack Engineer. Python, Django, PostgreSQL, React, Redux, AWS (EC2, S3), Docker, CI/CD, GitHub Actions.",
        "ground_truth": ["Python", "Django", "PostgreSQL", "React", "Redux", "AWS", "EC2", "S3", "Docker", "CI/CD", "GitHub Actions"]
    },
    {
        "id": 2, "industry": "Data Science",
        "input": "Jordan Smith. Data Scientist. Machine Learning, NLP, Python (Pandas, NumPy, Scikit-learn), LangChain, OpenAI API, MongoDB, SQL, Tableau, Matplotlib.",
        "ground_truth": ["Python", "Machine Learning", "NLP", "Pandas", "NumPy", "Scikit-learn", "LLM", "LangChain", "OpenAI API", "MongoDB", "SQL", "Tableau", "Matplotlib"]
    },
    {
        "id": 3, "industry": "Design",
        "input": "Casey Lane. UI/UX Designer. Figma, Adobe XD, Photoshop, HTML, CSS, Design Systems, Accessibility (WCAG).",
        "ground_truth": ["UI/UX Design", "Figma", "Adobe XD", "Photoshop", "HTML", "CSS", "Design Systems", "Accessibility", "WCAG"]
    },
    {
        "id": 4, "industry": "Cybersecurity",
        "input": "Morgan Reed. Security Analyst. Penetration Testing, Kali Linux, Wireshark, Metasploit, Nmap, SIEM (Splunk), Firewall configuration, CompTIA Security+.",
        "ground_truth": ["Penetration Testing", "Kali Linux", "Wireshark", "Metasploit", "Nmap", "SIEM", "Splunk", "Firewall", "Security+"]
    },
    {
        "id": 5, "industry": "DevOps",
        "input": "Riley Vance. DevOps Engineer. Kubernetes, Terraform, Ansible, Jenkins, Azure, CloudFormation, Bash Scripting, Prometheus, Grafana.",
        "ground_truth": ["Kubernetes", "Terraform", "Ansible", "Jenkins", "Azure", "CloudFormation", "Bash", "Prometheus", "Grafana"]
    },
    {
        "id": 6, "industry": "Marketing",
        "input": "Taylor Brooks. Digital Marketer. Google Analytics, SEO (Semrush), HubSpot, Mailchimp, Content Strategy, PPC, Meta Ads Manager, Copywriting.",
        "ground_truth": ["Google Analytics", "SEO", "Semrush", "HubSpot", "Mailchimp", "PPC", "Meta Ads", "Copywriting"]
    },
    {
        "id": 7, "industry": "Healthcare",
        "input": "Drew Parker. Medical Record Admin. Epic Systems, EHR Management, HIPAA Compliance, Medical Coding (ICD-10), Microsoft Excel, Patient Privacy.",
        "ground_truth": ["Epic Systems", "EHR", "HIPAA", "Medical Coding", "ICD-10", "Excel", "Patient Privacy"]
    },
    {
        "id": 8, "industry": "Finance",
        "input": "Sidney Gray. Financial Analyst. Financial Modeling, Bloomberg Terminal, SQL, Python for Finance, QuickBooks, Risk Management, ERP (SAP).",
        "ground_truth": ["Financial Modeling", "Bloomberg Terminal", "SQL", "Python", "QuickBooks", "Risk Management", "ERP", "SAP"]
    },
    {
        "id": 9, "industry": "Sales",
        "input": "Jamie Quinn. Sales Exec. Salesforce CRM, B2B Sales, Cold Calling, Negotiation, Lead Generation (LinkedIn Sales Navigator), Pitching.",
        "ground_truth": ["Salesforce", "CRM", "B2B Sales", "Lead Generation", "LinkedIn Sales Navigator", "Negotiation"]
    },
    {
        "id": 10, "industry": "Product Management",
        "input": "Skyler West. Product Manager. Jira, Confluence, Agile/Scrum, Product Roadmap, User Stories, A/B Testing, Mixpanel, Roadmunk.",
        "ground_truth": ["Jira", "Confluence", "Agile", "Scrum", "Product Roadmap", "User Stories", "A/B Testing", "Mixpanel", "Roadmunk"]
    },
    {
        "id": 11, "industry": "Mobile Dev",
        "input": "Parker Lee. iOS Developer. Swift, SwiftUI, Objective-C, Xcode, Core Data, Combine, Firebase, App Store Connect.",
        "ground_truth": ["Swift", "SwiftUI", "Objective-C", "Xcode", "Core Data", "Combine", "Firebase", "App Store Connect"]
    },
    {
        "id": 12, "industry": "Cloud Architect",
        "input": "Logan Miles. Cloud Architect. AWS Solutions Architect, GCP, Multi-cloud strategy, Serverless (Lambda), IAM, VPC, Route 53, CloudFront.",
        "ground_truth": ["AWS", "GCP", "Multi-cloud", "Serverless", "Lambda", "IAM", "VC", "Route 53", "CloudFront"]
    },
    {
        "id": 13, "industry": "AI Research",
        "input": "Quinn Taylor. AI Researcher. PyTorch, TensorFlow, Deep Learning, Computer Vision, Reinforcement Learning, CUDA, LaTeX.",
        "ground_truth": ["PyTorch", "TensorFlow", "Deep Learning", "Computer Vision", "Reinforcement Learning", "CUDA", "LaTeX"]
    },
    {
        "id": 14, "industry": "HR Tech",
        "input": "Cameron Blair. HR Specialist. Workday, Greenhouse ATS, Talent Acquisition, Payroll Systems, Employee Engagement, Employee Relations.",
        "ground_truth": ["Workday", "Greenhouse ATS", "Talent Acquisition", "Payroll Systems", "Employee Engagement", "Employee Relations"]
    },
    {
        "id": 15, "industry": "Game Dev",
        "input": "Avery Moss. Game Developer. Unity, C#, C++, Unreal Engine, Shaders, 3D Modeling (Blender), Physics Engines.",
        "ground_truth": ["Unity", "C#", "C++", "Unreal Engine", "Shaders", "Blender", "3D Modeling", "Physics Engines"]
    },
    {
        "id": 16, "industry": "E-commerce",
        "input": "Blake Jordan. E-commerce Manager. Shopify, Magento, Inventory Management, Google Shopping, Amazon Seller Central, Conversion Rate Optimization (CRO).",
        "ground_truth": ["Shopify", "Magento", "Inventory Management", "Google Shopping", "Amazon Seller Central", "CRO"]
    },
    {
        "id": 17, "industry": "Network Engineering",
        "input": "Reese Hunter. Network Engineer. Cisco (CCNA), Routing/Switching, BGP, OSPF, VPN, Network Security, Wi-Fi 6, SDN.",
        "ground_truth": ["Cisco", "CCNA", "Routing", "Switching", "BGP", "OSPF", "VPN", "Network Security", "SDN"]
    },
    {
        "id": 18, "industry": "Data Engineering",
        "input": "Hayden Cross. Data Engineer. Apache Spark, Kafka, ETL Pipelines, Hadoop, Snowflake, Airflow, BigQuery, Data Warehousing.",
        "ground_truth": ["Apache Spark", "Kafka", "ETL", "Hadoop", "Snowflake", "Airflow", "BigQuery", "Data Warehousing"]
    },
    {
        "id": 19, "industry": "Embedded Systems",
        "input": "Dakota Sky. Embedded Engineer. C, Embedded C, RTOS, Microcontrollers (STM32), I2C, SPI, UART, Firmware Dev.",
        "ground_truth": ["C", "Embedded C", "RTOS", "Microcontrollers", "STM32", "I2C", "SPI", "UART", "Firmware Development"]
    },
    {
        "id": 20, "industry": "QA Automation",
        "input": "River Song. QA Engineer. Selenium, Cypress, Automated Testing, TestRail, Bugzilla, Regression Testing, Load Testing (JMeter).",
        "ground_truth": ["Selenium", "Cypress", "Automated Testing", "TestRail", "Bugzilla", "Regression Testing", "Load Testing", "JMeter"]
    }
]

# --- BASELINES ---
def clean_json_list(text: str) -> str:
    start = text.find('[')
    end = text.rfind(']')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text

def single_prompt_extraction(text: str) -> List[str]:
    prompt = f"Extract all technical skills from this resume. Return ONLY a JSON list of strings. Text: {text}"
    output = call_groq(prompt)
    try:
        cleaned = clean_json_list(output)
        return json.loads(cleaned)
    except: return [output]

def agentic_extraction(text: str) -> List[str]:
    s1 = call_groq(f"Extract skills from: {text}")
    s2 = call_groq(f"Review the text: '{text}' and the skills: '{s1}'. Identify missed items and return a final consolidated JSON list of strings.", model="llama-3.3-70b-versatile")
    try:
        cleaned = clean_json_list(s2)
        return json.loads(cleaned)
    except: return [s2]

def clean_json(text: str) -> str:
    # Find the first { and the last }
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text

def evaluate_output(gt: List[str], extracted: List[str]) -> Dict:
    prompt = f"Judge the 'Extracted' list against the 'Ground Truth'. Extracted: {extracted}, Ground Truth: {gt}. Rate 1-5 and provide ONLY JSON: {{\"score\": int, \"reasoning\": str}}"
    output = call_groq(prompt, model="llama-3.3-70b-versatile")
    try:
        cleaned = clean_json(output)
        return json.loads(cleaned)
    except: 
        print(f"DEBUG: Failed to parse Judge output: {output}")
        return {"score": 3, "reasoning": "Parse failed"}

# --- RUN ---
results = []
print(f"Starting 20-Resume Benchmark...")
for entry in dataset:
    print(f"Processing ID {entry['id']}...")
    s_out = single_prompt_extraction(entry['input'])
    s_eval = evaluate_output(entry['ground_truth'], s_out)
    a_out = agentic_extraction(entry['input'])
    a_eval = evaluate_output(entry['ground_truth'], a_out)
    results.append({"id": entry['id'], "industry": entry['industry'], "input": entry['input'], "ground_truth": entry['ground_truth'], "single": {"score": s_eval['score'], "reasoning": s_eval['reasoning']}, "agentic": {"score": a_eval['score'], "reasoning": a_eval['reasoning']}})

with open("BENCHMARK_20_RESULTS.json", "w") as f:
    json.dump(results, f, indent=4)

print("20-Resume Benchmark Complete.")
