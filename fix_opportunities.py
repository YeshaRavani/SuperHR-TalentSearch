
import sqlite3
import uuid
import json
from datetime import datetime

# Connect to the database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# 1. Clean up the previous bad entries if they exist
# We'll just delete all that have admin-1 as author for now to reset, 
# or we can just update them. Let's update them to be safe.

cursor.execute("SELECT id FROM Opportunities WHERE author_id = 'admin-1'")
ids = [row[0] for row in cursor.fetchall()]

for opp_id in ids:
    cursor.execute("""
        UPDATE Opportunities 
        SET schedule_time = 'Flexible', 
            time_required = '5-10 hours/week',
            expectations = '[]',
            responsibilities = '[]',
            benefits = '[]',
            prerequisites = '[]'
        WHERE id = ?
    """, (opp_id,))

conn.commit()
conn.close()
print("Successfully fixed missing fields in opportunities.")
