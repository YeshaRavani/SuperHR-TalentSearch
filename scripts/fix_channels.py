import uuid
from backend.database import SessionLocal
from backend.orm_models import Channel, User

def fix_channels():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == "admin").first()
        admin_id = admin.id if admin else "admin-1"

        # Check by ID first
        ann = db.query(Channel).filter(Channel.id == "ch-announcements").first()
        if not ann:
            # Check by Name
            ann = db.query(Channel).filter(Channel.name == "Announcements").first()
            if ann:
                ann.id = "ch-announcements"
        
        if not ann:
            ann = Channel(
                id="ch-announcements",
                name="Official Announcements",
                description="Important updates from the admin team.",
                is_broadcast=True,
                author_id=admin_id
            )
            db.add(ann)
        else:
            ann.name = "Official Announcements"
            ann.is_broadcast = True
            ann.author_id = admin_id

        gen = db.query(Channel).filter(Channel.id == "ch-general").first()
        if not gen:
            gen = Channel(
                id="ch-general",
                name="General Chat",
                description="A place for everyone to talk."
            )
            db.add(gen)
        
        db.commit()
        print("Channels fixed!")
    finally:
        db.close()

if __name__ == "__main__":
    fix_channels()
