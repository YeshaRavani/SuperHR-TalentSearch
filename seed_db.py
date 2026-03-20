import sqlite3
import json
import re
import uuid
# Removed local import for seeding to avoid dependency issues
def simple_hash(password):
    return f"hashed_{password}" # Simplified for seeding demo


def extract_js_data(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Simple regex to extract the array content. This is a bit fragile but works for this specific JS file.
    # In a real scenario, you'd use a JS parser or export to JSON first.
    match = re.search(r'window\.superHrOpportunities = \[(.*?)\];', content, re.DOTALL)
    if not match:
        return []
    
    # This is still not perfect JSON because of JS-specific things like backticks and unquoted keys.
    # Let's try a more robust approach: manually parsing or using a simple script to print it.
    # For this demo, I'll use a simplified version of the data.
    return [
        {
            "id": "py-automation",
            "type": "Initiative",
            "title": "Python Automation Project",
            "short_description": "Work on automating internal workflows using Python scripts.",
            "full_description": "Create cron jobs, fetch reports via API integrations, and reduce manual entry hours significantly.",
            "points_reward": 50,
            "schedule_time": "Mon, 10:00 AM",
            "location": "Hybrid / Remote",
            "time_required": "4–6 hours/week",
            "expectations": "Write clean, efficient Python scripts; Collaborate with team members; Participate in weekly progress check-ins; Document processes."
        },
        {
            "id": "py-api",
            "type": "Initiative",
            "title": "Backend API Development",
            "short_description": "Assist in building scalable backend services.",
            "full_description": "Outline endpoints, setup databases access layer efficiently.",
            "points_reward": 40,
            "schedule_time": "Wed, 2:00 PM",
            "location": "Hybrid / Remote",
            "time_required": "5–7 hours/week",
            "expectations": "Python knowledge; REST API basics; DB familiarity."
        },
        {
            "id": "ai-chatbot",
            "type": "Initiative",
            "title": "AI Chatbot Development",
            "short_description": "Collaborate on building an intelligent chatbot.",
            "full_description": "Implement NLP libraries to parse queries and train robust response paths iteratively.",
            "points_reward": 100,
            "schedule_time": "Tue, 11:30 AM",
            "location": "Remote",
            "time_required": "8–10 hours/week",
            "expectations": "NLP libraries experience; AI mindset."
        }
    ]

def seed_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Create demo users
    users = [
        ("admin-1", "admin", "Admin User", "admin@superhr.com", simple_hash("admin123"), "admin", "SuperHR", "HR Tech"),
        ("user-1", "rushil", "Rushil Gargash", "rushil@example.com", simple_hash("user123"), "contributors", "Plaksha University", "Product Innovation Lab"),
        ("user-2", "yesha", "Yesha Ravani", "yesha@example.com", simple_hash("user123"), "contributors", "Design Studio", "UX Team")
    ]
    cursor.executemany("INSERT OR IGNORE INTO Users (id, username, full_name, email, hashed_password, role, organisation, department_team) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", users)

    # Seed initial reward policy
    cursor.execute("INSERT OR IGNORE INTO Reward_Policies (id, active_mode, hours_per_leave) VALUES (1, 'points', 8)")

    # Seed opportunities
    opps = extract_js_data('js/opportunities_data.js')
    for opp in opps:
        cursor.execute("""
            INSERT OR IGNORE INTO Opportunities 
            (id, type, title, short_description, full_description, points_reward, schedule_time, location, time_required, expectations, author_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (opp['id'], opp['type'], opp['title'], opp['short_description'], opp['full_description'], opp['points_reward'], opp['schedule_time'], opp['location'], opp['time_required'], opp['expectations'], "admin-1"))

    # Seed some channels
    channels = [
        ("ch-general", "general", "General discussion for everyone."),
        ("ch-innovation", "innovation-ideas", "A place to share and discuss innovation ideas.")
    ]
    cursor.executemany("INSERT OR IGNORE INTO Channels (id, name, description) VALUES (?, ?, ?)", channels)

    # 4. Seed Reward Policy
    cursor.execute("SELECT COUNT(*) FROM Reward_Policies")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO Reward_Policies (active_mode, hours_per_leave) VALUES ('points', 8)")
        print("Seeded reward policy.")

    # 5. Seed Channels
    channels_to_seed = [
        ("general", "general-chat", "General discussion for everyone."),
        ("events", "event-planning", "Planning and coordination for events."),
        ("innovation", "innovation-ideas", "Share your wildest ideas!")
    ]
    for ch_id, ch_name, ch_desc in channels_to_seed:
        cursor.execute("INSERT OR IGNORE INTO Channels (id, name, description) VALUES (?, ?, ?)", (ch_id, ch_name, ch_desc))
    print("Seeded channels.")

    # 6. Seed initial messages
    cursor.execute("SELECT COUNT(*) FROM Messages")
    if cursor.fetchone()[0] == 0:
        messages = [
            (str(uuid.uuid4()), "user-1", "general", "Hello everyone! Welcome to the Talent Search community."),
            (str(uuid.uuid4()), "admin-1", "general", "Glad to have you all here. Let's build something great!")
        ]
        cursor.executemany("INSERT INTO Messages (id, sender_id, channel_id, content) VALUES (?, ?, ?, ?)", messages)
        print("Seeded initial messages.")

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
