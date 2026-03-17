import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_notif_wrapper = """<div class="notif-wrapper">
                    <button class="icon-btn" id="notifToggle">
                        <span class="icon-dot" id="notifBadge">3</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>
                    <!-- Notification Hidden Dropdown Panel -->
                    <div class="notif-dropdown" id="notifDropdown">
                        <div class="notif-header">
                            <h4>System Alerts</h4>
                            <span class="notif-clear" id="markAllReadBtn" style="cursor: pointer; color: var(--sky-600); font-size: 0.85rem; font-weight: 600;">Mark all read</span>
                        </div>
                        <div class="notif-item">
                            <p style="margin-bottom: 0;"><strong>Opportunity Removed:</strong> "Advanced Python Workshop" was removed by admin.</p>
                            <div class="notif-actions" style="margin-top: 8px;">
                                <span style="font-size:0.8rem; color:var(--ink-400);">Just now</span>
                            </div>
                        </div>
                        <div class="notif-item">
                            <p style="margin-bottom: 0;"><strong>Role Updated:</strong> "Sarah Jenkins" role changed to Department Manager.</p>
                            <div class="notif-actions" style="margin-top: 8px;">
                                <a href="admin-manage-users.html" class="btn btn-sky" style="height:32px; padding:0 16px; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center;">View</a>
                            </div>
                        </div>
                        <div class="notif-item">
                            <p style="margin-bottom: 0;"><strong>System Reminder:</strong> Weekly platform backup completed successfully.</p>
                            <div class="notif-actions" style="margin-top: 8px;">
                                <span style="font-size:0.8rem; color:var(--ink-400);">1 hr ago</span>
                            </div>
                        </div>
                    </div>
                </div>
                """

    # Replace the existing notif-wrapper block
    # Regex looks for <div class="notif-wrapper">... and stops exactly before <!-- Profile Icon --> or <a href="admin-contributor-profile.html" class="profile"
    pattern = r'<div class="notif-wrapper">.*?(?=<!-- Profile Icon -->|<a class="profile"|<a href="admin-user-profile\.html" class="profile")'
    
    # Wait, some pages might not have notif-wrapper, but they have <button class="icon-btn" id="notifToggle"> inside a relative div or just directly
    # Let's inspect the exact pattern:
    # On admin-manage-opportunities, earlier we saw it was wrapped in `<div style="position: relative;">`
    # Let's replace whatever wraps `notifToggle` and `notifDropdown`
    
    # A robust way is to find id="notifToggle" and its container
    content = re.sub(
        r'<div(?: class="notif-wrapper"| style="position: relative;")?>\s*<button class="icon-btn" id="notifToggle">.*?(?=<!-- Profile Icon -->|<a class="profile"|<a aria-label="Profile"|<a href="admin-user-profile)',
        new_notif_wrapper,
        content,
        flags=re.DOTALL
    )

    # Injecting the badge clear JS before closing body tag
    js_logic = """
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const markBtn = document.getElementById('markAllReadBtn');
        const badge = document.getElementById('notifBadge');
        if (markBtn && badge) {
            markBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                badge.style.display = 'none';
                document.querySelectorAll('.notif-item').forEach(item => {
                    item.style.opacity = '0.6';
                });
            });
        }
    });
</script>
"""
    if "markAllReadBtn" not in content:
        # It's possible the regex didn't match if the id wasn't inserted, we can check
        pass
        
    if "markBtn.addEventListener" not in content:
        content = content.replace('</body>', f'{js_logic}</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


files = [
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-home.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-users.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-opportunities.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-system-settings.html'
]

for file in files:
    try:
        process_file(file)
        print(f"Processed: {file}")
    except Exception as e:
        print(f"Failed {file}: {e}")
