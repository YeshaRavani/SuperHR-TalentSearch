import re

def process():
    admin_opp_path = "/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-opportunities.html"
    sys_path = "/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-system-settings.html"
    
    with open(admin_opp_path, "r", encoding="utf-8") as f:
        admin_html = f.read()

    with open(sys_path, "r", encoding="utf-8") as f:
        sys_html = f.read()

    # Extract header from admin-manage-opportunities.html
    header_match = re.search(r'(<header class="topbar" id="navbar">.*?</header>)', admin_html, re.DOTALL)
    if not header_match:
        print("Header not found in admin html")
        return
    admin_header = header_match.group(1)
    
    # In the admin-system-settings page, the links need to reflect it being active.
    admin_header = admin_header.replace('<a href="admin-manage-opportunities.html" class="active">Manage Opportunities</a>', '<a href="admin-manage-opportunities.html">Manage Opportunities</a>')
    admin_header = admin_header.replace('<a href="admin-system-settings.html">System Settings</a>', '<a href="admin-system-settings.html" class="active">System Settings</a>')

    # Replace header in admin-system-settings.html
    sys_html = re.sub(r'<header class="topbar" id="navbar">.*?</header>', admin_header, sys_html, flags=re.DOTALL)

    with open(sys_path, "w", encoding="utf-8") as f:
        f.write(sys_html)
    print("Successfully injected admin-manage-opportunities.html header into admin-system-settings.html")

if __name__ == "__main__":
    process()
