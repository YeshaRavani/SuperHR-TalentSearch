import os
import re

user_files = [f for f in os.listdir('.') if f.endswith('.html') and not f.startswith('admin-') and f not in ['test.html', 'user-details.html']]
for f in user_files:
    with open(f, 'r') as file:
        content = file.read()
        
    nav_match = re.search(r'(<nav class="menu">)(.*?)(</nav>)', content, re.DOTALL)
    if nav_match:
        nav_content = nav_match.group(2)
        has_about = 'aboutus.html' in nav_content
        print(f"{f}: Has About Us? {has_about}")
    else:
        print(f"{f}: NO NAV MENU")
