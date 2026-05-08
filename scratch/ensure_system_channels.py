import sys
import os
import uuid

# Add parent directory to path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend import database, orm_models
from sqlalchemy.orm import Session

def ensure_system_channels():
    db: Session = database.SessionLocal()
    try:
        # Check for Official Announcements
        official = db.query(orm_models.Channel).filter(orm_models.Channel.name == "Official Announcements").first()
        if not official:
            admin = db.query(orm_models.User).filter(orm_models.User.role == "admin").first()
            new_channel = orm_models.Channel(
                id=str(uuid.uuid4()),
                name="Official Announcements",
                description="General platform-wide announcements and updates.",
                opportunity_id=None,
                is_broadcast=True,
                author_id=admin.id if admin else None
            )
            db.add(new_channel)
            db.commit()
            print("Created Official Announcements channel.")
        else:
            print("Official Announcements channel already exists.")
            
    except Exception as e:
        db.rollback()
        print(f"Error ensuring system channels: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    ensure_system_channels()
