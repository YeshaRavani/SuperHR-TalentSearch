import sys
import os
import uuid

# Add parent directory to path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend import database, orm_models
from sqlalchemy.orm import Session

def backfill_channels():
    db: Session = database.SessionLocal()
    try:
        # 1. Get all opportunities
        opportunities = db.query(orm_models.Opportunity).all()
        
        # 2. Get all existing opportunity_ids in Channels
        existing_channel_opp_ids = {c.opportunity_id for c in db.query(orm_models.Channel).filter(orm_models.Channel.opportunity_id.isnot(None)).all()}
        
        created_count = 0
        for opp in opportunities:
            if opp.id not in existing_channel_opp_ids:
                # Create a channel for this opportunity
                new_channel = orm_models.Channel(
                    id=str(uuid.uuid4()),
                    name=opp.title,
                    description=f"Official channel for {opp.title}",
                    opportunity_id=opp.id,
                    is_broadcast=getattr(opp, 'is_broadcast', False), # Use opp preference if exists
                    author_id=opp.author_id
                )
                db.add(new_channel)
                created_count += 1
        
        db.commit()
        print(f"Successfully backfilled {created_count} channels for existing opportunities.")
        
    except Exception as e:
        db.rollback()
        print(f"Error during backfill: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    backfill_channels()
