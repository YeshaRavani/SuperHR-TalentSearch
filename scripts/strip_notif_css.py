import re

files = [
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-home.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-users.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-opportunities.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-user-profile.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-system-settings.html'
]

# We need to strip the legacy `.notif-wrapper` / `.notif-dropdown` inline CSS out
# since role-permissions.js was just updated by the user to inject a normalized generic styling config.

pattern = r'\/\*\s*Notification Dropdown\s*\*\/.*?(?=\/\*\s*[A-Za-z ]+\s*\*\/|\<\/style\>)'

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # The regex looks for /* Notification Dropdown */ up to the next /* comment */ or </style>
        new_content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        # In case the comment isn't there, search specifically for .notif-wrapper and .notif-dropdown blocks
        if '.notif-dropdown {' in new_content:
            fallback_pattern = r'\.notif-wrapper\s*\{.*?(?=\.hero-section|\/\*|\<\/style\>)'
            # Let's write a safer explicit remover:
            def remove_css_block(text, block_start):
                idx = text.find(block_start)
                if idx == -1: return text
                # Simple bracket counting
                open_b = 0
                started = False
                end_idx = idx
                for i in range(idx, len(text)):
                    if text[i] == '{':
                        open_b += 1
                        started = True
                    elif text[i] == '}':
                        open_b -= 1
                        if started and open_b == 0:
                            end_idx = i + 1
                            break
                return text[:idx] + text[end_idx:]
            
            new_content = remove_css_block(new_content, '.notif-wrapper {')
            new_content = remove_css_block(new_content, '.notif-dropdown {')
            new_content = remove_css_block(new_content, '.notif-dropdown.active {')
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned CSS in: {filepath}")
    except Exception as e:
        print(f"Error checking {filepath}: {e}")
