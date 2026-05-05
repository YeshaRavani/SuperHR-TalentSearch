
import sqlite3
import uuid
import json
from datetime import datetime

# Connect to the database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Get some existing skills and their IDs
cursor.execute("SELECT id, name FROM Skills")
skills_map = {name: id for id, name in cursor.fetchall()}

def get_or_create_skill(name):
    if name in skills_map:
        return skills_map[name]
    cursor.execute("INSERT INTO Skills (name) VALUES (?)", (name,))
    new_id = cursor.lastrowid
    skills_map[name] = new_id
    return new_id

# 20 diverse opportunities
new_opps = [
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "RAG-based Clinical Assistant",
        "short_description": "Develop a Retrieval-Augmented Generation assistant for clinical decision support.",
        "points_reward": 150,
        "location": "Remote / Lab",
        "skills": ["RAG", "Python", "LLMs", "Clinical assistant development"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Geospatial Flood Risk Mapping",
        "short_description": "Use SAR data and Digital Elevation Models to map urban flood risks in NCR.",
        "points_reward": 120,
        "location": "Innovation Lab",
        "skills": ["Geospatial AI", "SAR-based Flood Mapping", "Digital Elevation Models", "Data Analysis"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Financial Risk Prediction Modeling",
        "short_description": "Build hybrid ML pipelines for predicting pre-delinquency in credit markets.",
        "points_reward": 130,
        "location": "Finance Hub",
        "skills": ["Financial Risk Prediction", "Machine Learning", "ROC-AUC", "Python"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Workshop",
        "title": "Functional MRI Data Analysis",
        "short_description": "Hands-on workshop on processing fMRI data using Nilearn and PCA.",
        "points_reward": 60,
        "location": "Bio-Tech Wing",
        "skills": ["fMRI", "Nilearn", "PCA", "Neurodegenerative Diseases"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Event",
        "title": "Annual Gala Choreography",
        "short_description": "Lead the choreography for the university's annual dance showcase.",
        "points_reward": 80,
        "location": "Main Stage",
        "skills": ["Dance Choreography", "Leadership", "Event Management"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Workshop",
        "title": "Debate Competition Mentoring",
        "short_description": "Mentor junior students for the upcoming national debate championships.",
        "points_reward": 45,
        "location": "Seminar Hall B",
        "skills": ["Debates", "Communication", "Speeches", "Public Engagement"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Responsive Analytics Dashboard",
        "short_description": "Create a high-performance React dashboard for real-time risk scoring visualization.",
        "points_reward": 110,
        "location": "Remote",
        "skills": ["React", "JavaScript", "Frontend Development", "Real-time Risk Scores"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Viral Reel Content Strategy",
        "short_description": "Design and execute a viral short-form video strategy for Talent Search growth.",
        "points_reward": 75,
        "location": "Studio / Hybrid",
        "skills": ["Viral Reel", "Social Media Strategy", "Content Execution", "Video Editing"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Tech-Fest Sponsorship Lead",
        "short_description": "Secure corporate partnerships and funding for the upcoming annual Tech-Fest.",
        "points_reward": 140,
        "location": "Global / Hybrid",
        "skills": ["Sponsorship", "Outreach", "Partnership development", "Fundraising"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Reinforcement Learning for Robotics",
        "short_description": "Implement RL algorithms to optimize robotic arm precision in manufacturing tasks.",
        "points_reward": 160,
        "location": "Robotics Lab",
        "skills": ["Reinforcement Learning", "Python", "Problem Solving", "C++"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Water Quality Metrics Extraction",
        "short_description": "Automate the extraction of water-quality ground truth data from research papers.",
        "points_reward": 90,
        "location": "Environmental Wing",
        "skills": ["Water-quality metrics extraction", "Data analysis", "Python", "Research"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Workshop",
        "title": "Figma Prototyping for Startups",
        "short_description": "Master advanced Figma techniques for building rapid startup MVPs.",
        "points_reward": 50,
        "location": "Design Studio",
        "skills": ["Figma", "UI Design", "Design Thinking", "Product-market fit evaluation"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Event",
        "title": "Student Council Representation",
        "short_description": "Represent your department in the university-wide student leadership summit.",
        "points_reward": 40,
        "location": "Council Chamber",
        "skills": ["Student council leadership", "Student representation", "Communication"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Brain Connectivity Patterns Study",
        "short_description": "Research project focused on mapping neuro-connectivity in stable CN patients.",
        "points_reward": 135,
        "location": "Neurology Dept",
        "skills": ["Brain Connectivity Patterns", "Functional MRI Data", "Data Science", "Research"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Workshop",
        "title": "Advanced SQL & Database Tuning",
        "short_description": "Optimize complex queries and database schemas for high-load applications.",
        "points_reward": 55,
        "location": "Lab 404",
        "skills": ["SQL", "Backend", "Scalability evaluation", "Data standardization"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "Intent Detection for Support Bots",
        "short_description": "Build high-accuracy intent detection models for automated customer support systems.",
        "points_reward": 105,
        "location": "Remote",
        "skills": ["Intent Detection", "NLP", "Machine Learning", "Customer Insights"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Initiative",
        "title": "User Persona Modeling for HR-Tech",
        "short_description": "Conduct deep user research to create data-driven personas for Talent Search.",
        "points_reward": 85,
        "location": "Hybrid",
        "skills": ["User Personas", "Persona Modeling", "UI/UX", "Research"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Workshop",
        "title": "Java Microservices with Spring",
        "short_description": "Build scalable cloud-native microservices using Java and Spring Boot.",
        "points_reward": 70,
        "location": "Virtual",
        "skills": ["JAVA", "Backend", "Scalability evaluation", "End-to-end System"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Event",
        "title": "Mega-Mixer Event Coordination",
        "short_description": "Coordinate logistics and attendee experience for the annual inter-college mixer.",
        "points_reward": 65,
        "location": "Campus Grounds",
        "skills": ["Event Management", "Logistics", "Coordination", "Communication strategy"]
    },
    {
        "id": str(uuid.uuid4()),
        "type": "Workshop",
        "title": "Prompt Engineering Masterclass",
        "short_description": "Learn advanced techniques for getting the most out of Llama 3 and GPT-4.",
        "points_reward": 45,
        "location": "Innovation Hall",
        "skills": ["Prompt Engineering", "LLMs", "AI", "Content strategy"]
    }
]

# Insert opportunities
for opp in new_opps:
    cursor.execute("""
        INSERT INTO Opportunities (
            id, type, title, short_description, full_description, 
            points_reward, location, status, author_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        opp['id'], opp['type'], opp['title'], opp['short_description'], 
        opp['short_description'], opp['points_reward'], opp['location'], 
        'active', 'admin-1', datetime.now().isoformat()
    ))
    
    # Add skills
    for s_name in opp['skills']:
        s_id = get_or_create_skill(s_name)
        cursor.execute("""
            INSERT INTO Opportunity_Skills (opportunity_id, skill_id)
            VALUES (?, ?)
        """, (opp['id'], s_id))

conn.commit()
conn.close()
print("Successfully seeded 20 diverse opportunities.")
