import sqlite3
import os

def init_db():
    db_path = 'database.db'
    schema_path = 'schema.sql'
    
    # Check if schema file exists
    if not os.path.exists(schema_path):
        print(f"Error: {schema_path} not found in the current directory.")
        return
        
    print(f"Initializing database from '{schema_path}'...")
    
    # Establish a connection to the database (creates it if it doesn't exist)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Read the provided schema file
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
        
    try:
        # Execute the layout script
        cursor.executescript(schema_sql)
        print(f"Success! Database initialized and saved as '{db_path}'.")
    except sqlite3.Error as e:
        print(f"An SQLite error occurred: {e}")
    finally:
        # Save (commit) the changes and close out the connection
        conn.commit()
        conn.close()

if __name__ == '__main__':
    init_db()
