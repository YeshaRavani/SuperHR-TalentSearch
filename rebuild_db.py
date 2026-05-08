from backend.database import engine, Base
import os
from seed_db import seed_db

def rebuild_db():
    db_path = 'database.db'
    if os.path.exists(db_path):
        print(f"Removing existing database at {db_path}...")
        os.remove(db_path)
    
    print("Creating new database with current models...")
    Base.metadata.create_all(bind=engine)
    
    print("Seeding database...")
    seed_db()
    print("Database rebuild complete!")

if __name__ == "__main__":
    rebuild_db()
