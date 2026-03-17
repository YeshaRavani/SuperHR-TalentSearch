import re
import glob

files = glob.glob('/Users/rushilgargash/Desktop/SuperHR-TalentSearch/*.html')
pattern = re.compile(
    r'(<a[^>]*href="initiatives\.html"[^>]*>\s*Initiatives\s*</a>)\s*'
    r'(<a[^>]*href="workshops\.html"[^>]*>\s*Workshops\s*</a>)\s*'
    r'(<a[^>]*href="events\.html"[^>]*>\s*Events\s*</a>)',
    re.IGNORECASE
)

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    def replacer(match):
        # preserve indentation of the first matched link
        str_val = match.group(0)
        has_active = 'class="active"' in str_val or "class='active'" in str_val or 'class="active"' in str_val.lower()
        
        if has_active:
            return '<a href="opportunities.html" class="active">Opportunities</a>'
        else:
            return '<a href="opportunities.html">Opportunities</a>'

    new_content, count = pattern.subn(replacer, content)
    
    if count > 0:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
    else:
        print(f"No match found in {f}")
