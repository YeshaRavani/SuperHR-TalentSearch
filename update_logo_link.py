import os
import re
import glob

html_files = glob.glob('/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/*.html')

new_logo_open = '<a href="index (1).html" class="logo" title="Go to home" aria-label="Go to home" style="text-decoration: none; color: inherit;">'

# We look for <div class="logo"> ... </div> or <a class="logo" ...> ... </a>
# We can just match the opening block <div class="logo"> or <a ... class="logo" ...>
# But wait, looking at the grep, it's mostly `<div class="logo">...</div>`.

div_pattern = re.compile(r'<div class="logo">(.*?)</div>', re.DOTALL)
a_pattern = re.compile(r'<a[^>]*class="logo"[^>]*>(.*?)</a>', re.DOTALL)

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Replace <div> wrappers
    # ensure it doesn't match greedy inner divs if it contains any, but usually it only contains an img and text.
    def div_replacer(match):
        inner = match.group(1)
        return f'{new_logo_open}{inner}</a>'
        
    content = div_pattern.sub(div_replacer, content)
    
    # 2. Replace existing <a> wrappers
    def a_replacer(match):
        inner = match.group(1)
        return f'{new_logo_open}{inner}</a>'
        
    content = a_pattern.sub(a_replacer, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {os.path.basename(file_path)}")
