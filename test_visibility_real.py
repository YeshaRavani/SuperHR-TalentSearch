
import sqlite3
from datetime import datetime

DB_PATH = "database.db"
user_a_id = 'e19866e2-43c4-4abe-b081-fbd63199acf9'

def simulate_post_by_user_a():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Insert a test opportunity authored by User A
    cursor.execute("""
        INSERT INTO Opportunities (
            id, type, title, short_description, full_description, 
            points_reward, location, status, author_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'test-opp-user-a', 'Initiative', 'User A Private Post', 'This should not show in Discovery for User A', 
        'Longer desc', 10, 'Virtual', 'active', user_a_id, datetime.now().isoformat()
    ))
    
    conn.commit()
    print("\n[STEP 1] Simulated User A posting a new opportunity.")
    
    # 2. Check Discovery (should EXCLUDE this post for User A)
    cursor.execute("SELECT COUNT(*) FROM Opportunities WHERE author_id != ? AND status != 'removed'", (user_a_id,))
    discovery_count = cursor.fetchone()[0]
    print(f"[STEP 2] Discovery count for User A (excluding own posts): {discovery_count}")
    
    # 3. Check Posted (should INCLUDE this post for User A)
    cursor.execute("SELECT COUNT(*) FROM Opportunities WHERE author_id = ? AND status != 'removed'", (user_a_id,))
    posted_count = cursor.fetchone()[0]
    print(f"[STEP 3] Posted count for User A: {posted_count}")
    
    # 4. Check for another user (should INCLUDE User A's post)
    cursor.execute("SELECT COUNT(*) FROM Opportunities WHERE author_id != 'admin-1' AND status != 'removed'")
    admin_discovery_count = cursor.fetchone()[0]
    print(f"[STEP 4] Discovery count for Admin (should see User A's post): {admin_discovery_count}")
    
    # Clean up test data
    cursor.execute("DELETE FROM Opportunities WHERE id = 'test-opp-user-a'")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    simulate_post_by_user_a()
