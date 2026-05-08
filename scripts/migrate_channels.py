import sqlite3
import os

def migrate():
    db_path = "/Users/rushilgargash/Desktop/SuperHR-TalentSearch/database.db"
    if not os.path.exists(db_path):
        print("Database not found!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add opportunity_id
        cursor.execute("ALTER TABLE Channels ADD COLUMN opportunity_id TEXT REFERENCES Opportunities(id) ON DELETE CASCADE")
        print("Added opportunity_id")
    except sqlite3.OperationalError:
        print("opportunity_id already exists or error")

    try:
        # Add is_broadcast
        cursor.execute("ALTER TABLE Channels ADD COLUMN is_broadcast BOOLEAN DEFAULT 0")
        print("Added is_broadcast")
    except sqlite3.OperationalError:
        print("is_broadcast already exists or error")

    try:
        # Add author_id
        cursor.execute("ALTER TABLE Channels ADD COLUMN author_id TEXT REFERENCES Users(id) ON DELETE SET NULL")
        print("Added author_id")
    except sqlite3.OperationalError:
        print("author_id already exists or error")

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
