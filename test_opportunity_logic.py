
import sqlite3
import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
DB_PATH = "database.db"

def check_db_counts():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM Opportunities")
    count = cursor.fetchone()[0]
    print(f"Total Opportunities in DB: {count}")
    conn.close()
    return count

def test_filtering_logic():
    # We'll use two different users to test visibility
    # User A: e19866e2-43c4-4abe-b081-fbd63199acf9 (Rushil Gargash8)
    # User B: admin-1 (Admin)
    
    # We need tokens. Assuming the user is running the server locally.
    # If not, we can check the DB directly for the logic.
    
    print("\n--- Testing Visibility Logic in DB ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    user_a_id = 'e19866e2-43c4-4abe-b081-fbd63199acf9'
    user_b_id = 'admin-1'
    
    # 1. Check opportunities NOT authored by User A
    cursor.execute("SELECT COUNT(*) FROM Opportunities WHERE author_id != ?", (user_a_id,))
    not_authored_by_a = cursor.fetchone()[0]
    print(f"Opportunities User A should see in 'Discovery' (not their own): {not_authored_by_a}")
    
    # 2. Check opportunities AUTHORED by User A
    cursor.execute("SELECT COUNT(*) FROM Opportunities WHERE author_id = ?", (user_a_id,))
    authored_by_a = cursor.fetchone()[0]
    print(f"Opportunities User A should see in 'Posted': {authored_by_a}")
    
    # 3. Verify specific new opportunity
    cursor.execute("SELECT title, author_id FROM Opportunities ORDER BY created_at DESC LIMIT 1")
    latest = cursor.fetchone()
    print(f"Latest Opportunity: '{latest[0]}' posted by {latest[1]}")
    
    conn.close()

if __name__ == "__main__":
    count = check_db_counts()
    if count >= 40:
        print("Success: At least 40 opportunities found (20+ original + 20 new).")
    else:
        print("Warning: Opportunity count is lower than expected.")
        
    test_filtering_logic()
