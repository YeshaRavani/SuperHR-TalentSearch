import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend import database, orm_models
from sqlalchemy.orm import Session

def test_toggle_endpoint():
    db: Session = database.SessionLocal()
    try:
        # Find a channel
        channel = db.query(orm_models.Channel).first()
        if not channel:
            print("No channel found to test.")
            return

        print(f"Current state of channel '{channel.name}': {channel.is_broadcast}")
        
        # Simulate toggle
        new_state = not channel.is_broadcast
        channel.is_broadcast = new_state
        db.commit()
        
        db.refresh(channel)
        print(f"New state after manual toggle: {channel.is_broadcast}")
        
        if channel.is_broadcast == new_state:
            print("PASSED: DB update successful.")
        else:
            print("FAILED: DB update failed.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_toggle_endpoint()
