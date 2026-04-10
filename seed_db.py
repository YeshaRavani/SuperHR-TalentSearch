import json
import uuid
from datetime import datetime
from backend.database import SessionLocal, engine, Base
from backend.orm_models import User, Opportunity, Channel, Message, Invitation, RewardPolicy, Skill, UserOpportunity
from backend.utils.auth import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        # 2. Seed Skills
        skills_list = ["Python", "Automation", "Workflow Optimization", "APIs", "Backend", "Data Analysis", "Pandas", "AI", "NLP", "Machine Learning", "Video Editing", "Content Creation", "Premiere Pro", "Photography", "Event Coverage", "Lighting", "Portraits", "Performance", "Stage Presence", "Public Engagement", "Design", "UI/UX", "Entrepreneurship", "Pitching", "Social Media", "Shorts", "Marketing", "Splicing", "Composition", "Logistics", "Management"]
        skill_objs = {}
        for s_name in skills_list:
            skill = db.query(Skill).filter(Skill.name == s_name).first()
            if not skill:
                skill = Skill(name=s_name)
                db.add(skill)
                db.flush()
            skill_objs[s_name] = skill

        # 3. Seed Users
        users_data = [
            {"id": "admin-1", "username": "admin", "full_name": "Admin User", "email": "admin@superhr.com", "role": "admin", "organisation": "SuperHR", "department_team": "HR Tech"},
            {"id": "user-1", "username": "rushil", "full_name": "Rushil Gargash", "email": "rushil@example.com", "role": "contributors", "organisation": "Plaksha University", "department_team": "Product Innovation Lab"},
            {"id": "user-2", "username": "yesha", "full_name": "Yesha Ravani", "email": "yesha@example.com", "role": "contributors", "organisation": "Design Studio", "department_team": "UX Team"},
            {"id": "user-3", "username": "alex", "full_name": "Alex Rivera", "email": "alex@example.com", "role": "contributors", "organisation": "SuperHR", "department_team": "Engineering"},
            {"id": "user-4", "username": "sarah", "full_name": "Sarah Chen", "email": "sarah@example.com", "role": "contributors", "organisation": "SuperHR", "department_team": "Marketing"},
            {"id": "user-5", "username": "mike", "full_name": "Mike Ross", "email": "mike@example.com", "role": "contributors", "organisation": "SuperHR", "department_team": "Legal"},
            {"id": "user-6", "username": "hod-1", "full_name": "Director Jane", "email": "jane@superhr.com", "role": "head_of_department", "organisation": "SuperHR", "department_team": "Leadership"}
        ]
        
        user_objs = {}
        for u in users_data:
            user = db.query(User).filter(User.id == u["id"]).first()
            if not user:
                user = User(
                    id=u["id"],
                    username=u["username"],
                    full_name=u["full_name"],
                    email=u["email"],
                    hashed_password=get_password_hash("admin123" if u["role"] == "admin" else "user123"),
                    role=u["role"],
                    organisation=u["organisation"],
                    department_team=u["department_team"],
                    total_points=100 if u["id"] != "admin-1" else 0
                )
                db.add(user)
                db.flush()
            user_objs[u["id"]] = user

        # 4. Seed Opportunities from js/opportunities_data.js
        opps_data = [
            {
                "id": "py-automation",
                "type": "Initiative",
                "title": "Python Automation Project",
                "short_description": "Work on automating internal workflows using Python scripts and improve operational efficiency.",
                "full_description": "Create cron jobs, fetch reports via API integrations, and reduce manual entry hours significantly.",
                "points_reward": 50,
                "schedule_time": "Mon, 10:00 AM",
                "location": "Hybrid / Remote",
                "time_required": "4–6 hours/week",
                "expectations": ["Write clean, efficient Python scripts", "Collaborate with team members on workflow improvements", "Participate in weekly progress check-ins", "Document processes and automation logic"],
                "responsibilities": ["Build automation scripts for repetitive tasks", "Integrate APIs for data retrieval", "Optimize internal workflows", "Debug and maintain existing scripts"],
                "benefits": ["Hands-on experience with real-world automation", "Exposure to API integrations and backend workflows", "Opportunity to collaborate with cross-functional teams", "Certificate / recognition upon completion"],
                "prerequisites": ["Basic knowledge of Python", "Understanding of APIs (REST)", "Familiarity with scripting or automation tools", "Problem-solving mindset"],
                "skills": ["Python", "Automation", "Workflow Optimization"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #eff6ff, #bfdbfe)",
                "icon_color": "#3b82f6",
                "main_icon": '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
            },
            {
                "id": "py-api",
                "type": "Initiative",
                "title": "Backend API Development",
                "short_description": "Assist in building scalable backend services utilizing modern Python frameworks.",
                "full_description": "Outline endpoints, setup databases access layer efficiently.",
                "points_reward": 40,
                "schedule_time": "Wed, 2:00 PM",
                "location": "Hybrid / Remote",
                "time_required": "5–7 hours/week",
                "expectations": ["Python knowledge", "REST API basics", "DB familiarity"],
                "skills": ["Python", "APIs", "Backend"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
                "icon_color": "#22c55e",
                "main_icon": '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
            },
            {
                "id": "py-data",
                "type": "Workshop",
                "title": "Data Processing Task",
                "short_description": "Analyze and process datasets for insights.",
                "full_description": "Conduct cleaning sprints with Panda libraries to optimize sheet reads securely.",
                "points_reward": 30,
                "schedule_time": "Fri, 4:00 PM",
                "location": "Main Hall",
                "time_required": "2 hours",
                "expectations": ["Familiarity with Pandas", "Attention to detail"],
                "skills": ["Python", "Data Analysis", "Pandas"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #fefce8, #fef08a)",
                "icon_color": "#eab308",
                "main_icon": '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>'
            },
            {
                "id": "ai-chatbot",
                "type": "Initiative",
                "title": "AI Chatbot Development",
                "short_description": "Collaborate on building an intelligent chatbot to enhance user engagement.",
                "full_description": "Implement NLP libraries to parse queries and train robust response paths iteratively.",
                "points_reward": 100,
                "schedule_time": "Tue, 11:30 AM",
                "location": "Remote",
                "time_required": "8–10 hours/week",
                "expectations": ["NLP libraries experience", "AI mindset"],
                "skills": ["AI", "NLP", "Machine Learning"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
                "icon_color": "#ec4899",
                "main_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
            },
            {
                "id": "ai-model",
                "type": "Initiative",
                "title": "ML Model Training",
                "short_description": "Train machine learning models on internal datasets.",
                "full_description": "Improve prediction scores through iterative training and validation.",
                "points_reward": 80,
                "schedule_time": "Thu, 3:00 PM",
                "location": "Office",
                "time_required": "6–8 hours/week",
                "expectations": ["ML theory knowledge", "Python proficiency"],
                "skills": ["AI", "ML", "Data Science"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #faf5ff, #e9d5ff)",
                "icon_color": "#a855f7",
                "main_icon": '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>'
            },
            {
                "id": "vid-highlight",
                "type": "Initiative",
                "title": "Event Highlight Video Creation",
                "short_description": "Edit and produce engaging highlight videos for major events.",
                "full_description": "Splice clips, sync with audio tracks, scale typography, and publish short promotional montages.",
                "points_reward": 45,
                "schedule_time": "Wed, 10:00 AM",
                "location": "Studio",
                "time_required": "5 hours/week",
                "expectations": ["Video editing skills", "Creativity"],
                "skills": ["Video Editing", "Content Creation", "Premiere Pro"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
                "icon_color": "#ec4899",
                "main_icon": '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
            },
            {
                "id": "photo-coverage",
                "type": "Event",
                "title": "Event Photography Coverage",
                "short_description": "Capture high-quality images during events and workshops.",
                "full_description": "Setup lighting, interact with attendees politely, and submit graded edits post activities.",
                "points_reward": 60,
                "schedule_time": "Sat, 2:00 PM",
                "location": "Grand Ballroom",
                "time_required": "4 hours",
                "expectations": ["Photography experience", "Own gear preferred"],
                "skills": ["Photography", "Event Coverage", "Lighting"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #eff6ff, #bfdbfe)",
                "icon_color": "#3b82f6",
                "main_icon": '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line>'
            },
            {
                "id": "perf-showcase",
                "type": "Event",
                "title": "Talent Showcase Performance",
                "short_description": "Participate in live performances to showcase your skills.",
                "full_description": "Coordinate sets, engage crowds with dynamic formats, and leave memorable feedback loops.",
                "points_reward": 70,
                "schedule_time": "Fri, 7:00 PM",
                "location": "Auditorium",
                "time_required": "3 hours",
                "expectations": ["Stage presence", "Performance talent"],
                "skills": ["Performance", "Stage Presence", "Public Engagement"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #faf5ff, #e9d5ff)",
                "icon_color": "#a855f7",
                "main_icon": '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line>'
            },
            {
                "id": "curated-startup",
                "type": "Initiative",
                "title": "Startup Pitch Collaboration",
                "short_description": "Work with a team to build and pitch a startup idea.",
                "full_description": "Develop prototypes, layout business models, and present to judges and advisors.",
                "points_reward": 120,
                "schedule_time": "Mon, 6:00 PM",
                "location": "Innovation Hub",
                "time_required": "10 hours/week",
                "expectations": ["Entrepreneurship spirit", "Pitching skills"],
                "skills": ["Interested", "Entrepreneurship", "Pitching"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #eff6ff, #bfdbfe)",
                "icon_color": "#3b82f6",
                "main_icon": '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
            },
            {
                "id": "curated-uiux",
                "type": "Workshop",
                "title": "UI/UX Redesign Sprint",
                "short_description": "Redesign internal tools for better usability.",
                "full_description": "Conduct user research, wireframe ideal paths, and improve system navigation.",
                "points_reward": 55,
                "schedule_time": "Wed, 3:00 PM",
                "location": "Design Studio",
                "time_required": "4 hours",
                "expectations": ["Design thinking", "UI/UX awareness"],
                "skills": ["Interested", "Design", "UI/UX"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
                "icon_color": "#22c55e",
                "main_icon": '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
            },
            {
                "id": "curated-content",
                "type": "Initiative",
                "title": "Content Creation Campaign",
                "short_description": "Create engaging content for social media initiatives.",
                "full_description": "Shoot promos, edit shorts, and manage calendar drops securely.",
                "points_reward": 40,
                "schedule_time": "Thu, 4:00 PM",
                "location": "Remote",
                "time_required": "5 hours/week",
                "expectations": ["Content creation awareness", "Social media savvy"],
                "skills": ["Interested", "Content", "Marketing"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #fefce8, #fef08a)",
                "icon_color": "#eab308",
                "main_icon": '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>'
            },
            {
                "id": "curated-event",
                "type": "Event",
                "title": "Community Event Organizer",
                "short_description": "Plan and execute community engagement events.",
                "full_description": "Outline run sheets, manage logistics, and ensure attendee satisfaction.",
                "points_reward": 90,
                "schedule_time": "Sat, 2:00 PM",
                "location": "Civic Center",
                "time_required": "6 hours",
                "expectations": ["Management skills", "Logistics organization"],
                "skills": ["Interested", "Management", "Logistics"],
                "tag_icon": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                "bg_gradient": "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
                "icon_color": "#ec4899",
                "main_icon": '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="2" x2="8" y2="6"></line>'
            }
        ]

        opp_objs = {}
        for o in opps_data:
            opp = db.query(Opportunity).filter(Opportunity.id == o["id"]).first()
            if not opp:
                opp = Opportunity(
                    id=o["id"],
                    type=o["type"],
                    title=o["title"],
                    short_description=o["short_description"],
                    full_description=o["full_description"],
                    points_reward=o["points_reward"],
                    schedule_time=o["schedule_time"],
                    location=o["location"],
                    time_required=o["time_required"],
                    expectations=json.dumps(o["expectations"]),
                    responsibilities=json.dumps(o.get("responsibilities", [])),
                    benefits=json.dumps(o.get("benefits", [])),
                    prerequisites=json.dumps(o.get("prerequisites", [])),
                    main_icon=o["main_icon"],
                    tag_icon=o["tag_icon"],
                    bg_gradient=o["bg_gradient"],
                    icon_color=o["icon_color"],
                    author_id="admin-1",
                    status="active"
                )
                # Add skills
                for s_name in o["skills"]:
                    if s_name in skill_objs:
                        opp.skills.append(skill_objs[s_name])
                db.add(opp)
                db.flush()
            opp_objs[o["id"]] = opp

        # ... (rest of seeding for channels, messages, etc. - keep as is)
        # 5. Seed Channels
        channels_data = [
            {"id": "ch-general", "name": "General Chat", "description": "General discussion for everyone."},
            {"id": "ch-announcements", "name": "Announcements", "description": "Important platform updates."},
            {"id": "ch-innovation", "name": "Innovation Hub", "description": "A place to share and discuss innovation ideas."},
            {"id": "ch-python", "name": "Python Squad", "description": "Dedicated space for Python enthusiasts."}
        ]
        
        channel_objs = {}
        for c in channels_data:
            channel = db.query(Channel).filter(Channel.id == c["id"]).first()
            if not channel:
                channel = Channel(id=c["id"], name=c["name"], description=c["description"])
                db.add(channel)
                db.flush()
            channel_objs[c["id"]] = channel

        # 6. Seed Messages
        if db.query(Message).count() == 0:
            messages_data = [
                {"sender_id": "user-1", "channel_id": "ch-general", "content": "Hey everyone! Happy to be here."},
                {"sender_id": "admin-1", "channel_id": "ch-general", "content": "Welcome Rushil! Let's get started with some opportunities."},
                {"sender_id": "user-2", "channel_id": "ch-innovation", "content": "Anyone interested in starting a new design sprint?"},
                {"sender_id": "user-3", "channel_id": "ch-python", "content": "Check out this new automation library I found!"},
                {"sender_id": "user-4", "channel_id": "ch-general", "content": "The photography workshop was amazing!"},
                {"sender_id": "user-1", "receiver_id": "user-2", "content": "Hey Yesha, can you help me with the UI for the Python project?"},
                {"sender_id": "user-2", "receiver_id": "user-1", "content": "Sure Rushil, let's chat in the innovation hub."},
                {"sender_id": "user-5", "channel_id": "ch-general", "content": "Glad to see the legal team getting involved too!"},
                {"sender_id": "hod-1", "channel_id": "ch-announcements", "content": "New rewards policy is now live! Check it out."},
                {"sender_id": "admin-1", "receiver_id": "user-3", "content": "Alex, your progress on the API development is great."}
            ]
            for m in messages_data:
                msg = Message(
                    id=str(uuid.uuid4()),
                    sender_id=m["sender_id"],
                    channel_id=m.get("channel_id"),
                    receiver_id=m.get("receiver_id"),
                    content=m["content"],
                    created_at=datetime.utcnow()
                )
                db.add(msg)
            db.flush()

        # 7. Seed User Interactions
        if db.query(UserOpportunity).count() == 0:
            interactions = [
                {"user_id": "user-1", "opp_id": "py-automation", "status": "applied"},
                {"user_id": "user-2", "opp_id": "curated-uiux", "status": "applied"},
                {"user_id": "user-3", "opp_id": "py-api", "status": "applied"},
                {"user_id": "user-4", "opp_id": "curated-content", "status": "applied"}
            ]
            for inter in interactions:
                user_opp = UserOpportunity(
                    id=str(uuid.uuid4()),
                    user_id=inter["user_id"],
                    opportunity_id=inter["opp_id"],
                    status=inter["status"]
                )
                db.add(user_opp)
            db.flush()

        # 8. Seed Invitations
        if db.query(Invitation).count() == 0:
            invitations_data = [
                {"sender_id": "admin-1", "receiver_id": "user-1", "topic": "Special Project", "message": "Would you like to lead the next Python sprint?"},
                {"sender_id": "user-2", "receiver_id": "user-4", "topic": "Collab", "message": "Let's collaborate on the next marketing video."},
                {"sender_id": "hod-1", "receiver_id": "user-3", "topic": "Promotion", "message": "I'd like to discuss your future role in the engineering team."}
            ]
            for inv in invitations_data:
                invitation = Invitation(
                    id=str(uuid.uuid4()),
                    sender_id=inv["sender_id"],
                    receiver_id=inv["receiver_id"],
                    topic=inv["topic"],
                    message=inv["message"],
                    status="pending"
                )
                db.add(invitation)
            db.flush()

        # 9. Seed Reward Policy
        policy = db.query(RewardPolicy).first()
        if not policy:
            policy = RewardPolicy(active_mode="points", hours_per_leave=8)
            db.add(policy)
            db.flush()

        db.commit()
        print("Database seeding completed successfully with high-fidelity realistic data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
