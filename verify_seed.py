from backend.database import SessionLocal
from backend.orm_models import User, Opportunity, Channel, Message, Skill, UserOpportunity, Invitation
from backend.utils.auth import verify_password

def verify_seed():
    db = SessionLocal()
    try:
        print("--- Verification Started ---")
        
        # 1. Users
        users = db.query(User).all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f" - {u.username} ({u.role})")
        
        # 2. Authentication
        admin = db.query(User).filter(User.username == "admin").first()
        if admin and verify_password("admin123", admin.hashed_password):
            print("Auth Verification: Admin login SUCCESS")
        else:
            print("Auth Verification: Admin login FAILED")
            
        rushil = db.query(User).filter(User.username == "rushil").first()
        if rushil and verify_password("user123", rushil.hashed_password):
            print("Auth Verification: Contributor (rushil) login SUCCESS")
        else:
            print("Auth Verification: Contributor (rushil) login FAILED")

        # 3. Opportunities
        opps = db.query(Opportunity).all()
        print(f"Total Opportunities: {len(opps)}")
        
        # 4. Channels and Messages
        channels = db.query(Channel).all()
        print(f"Total Channels: {len(channels)}")
        messages = db.query(Message).all()
        print(f"Total Messages: {len(messages)}")
        
        # 5. Skills
        skills = db.query(Skill).all()
        print(f"Total Skills: {len(skills)}")
        
        # 6. Relationships (Skills of an opportunity)
        py_auto = db.query(Opportunity).filter(Opportunity.id == "py-automation").first()
        if py_auto:
            print(f"Skills for 'py-automation': {[s.name for s in py_auto.skills]}")
            
        # 7. Applications
        applications = db.query(UserOpportunity).all()
        print(f"Total Applications/Interests: {len(applications)}")
        
        print("--- Verification Completed ---")
        
    finally:
        db.close()

if __name__ == "__main__":
    verify_seed()
