import re

def process():
    opp_path = "/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/opportunities.html"
    admin_opp_path = "/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-opportunities.html"
    
    with open(opp_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Define admin replacements
    admin_nav = """        <nav class="menu">
          <a href="admin-home.html">Home</a>
          <a href="admin-manage-users.html">Manage Users</a>
          <a href="admin-manage-opportunities.html" class="active">Manage Opportunities</a>
          <a href="admin-system-settings.html">System Settings</a>
        </nav>"""

    admin_notifs = """            <div class="notif-dropdown" id="notifDropdown">
              <div class="notif-header">
                <h4>System Alerts</h4>
                <span class="notif-clear">Mark all read</span>
              </div>
              <div class="notif-item">
                <p style="margin-bottom: 0;"><strong>System Reminder:</strong> Weekly data backup completed successfully.</p>
              </div>
              <div class="notif-item">
                <p><strong>Action Log:</strong> "Summer Internship" post was successfully removed.</p>
              </div>
              <div class="notif-item">
                <p><strong>Access Request:</strong> 2 users have requested "Head of Department" permissions.</p>
                <div class="notif-actions">
                  <a href="admin-manage-users.html" class="btn btn-sky" style="height:32px; padding:0 16px; font-size:0.8rem; text-decoration:none; display:flex; align-items:center; justify-content:center;">Review Access Logs</a>
                </div>
              </div>
            </div>"""

    admin_profile = """          <a class="profile" aria-label="Profile" href="admin-contributor-profile.html" title="Admin Profile" style="color:var(--ink-700);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px; height:20px;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </a>"""

    # 1. Replace nav
    html = re.sub(r'<nav class="menu">.*?</nav>', admin_nav, html, flags=re.DOTALL)

    # 2. Replace notifications
    html = re.sub(r'<div class="notif-dropdown" id="notifDropdown">.*?</div>\s*</div>', admin_notifs + '\n          </div>', html, flags=re.DOTALL)

    # 3. Replace profile icon
    html = re.sub(r'<a class="profile" aria-label="Profile" href="profile\.html">.*?</a>', admin_profile, html, flags=re.DOTALL)

    # 4. Replace Title and Subtext
    html = re.sub(r'<h1>Opportunities Hub</h1>', '<h1>Manage Opportunities</h1>', html)
    html = re.sub(r'<p class="head-subtext">Discover events, initiatives, and workshops you can participate in all in one place.\n\s*</p>', '<p class="head-subtext">Review and remove platform opportunities.</p>', html)

    # 5. Remove footer-cta
    html = re.sub(r'<section class="footer-cta reveal">.*?</section>', '', html, flags=re.DOTALL)

    # 6. Inject override script for admin actions
    override_script = """
  <script>
window.generateOpportunityCardHTML = function (opp, indexDelay = 0) {
    const delayStyle = indexDelay > 0 ? `style="transition-delay: ${indexDelay * 0.1}s;"` : '';
    const animDelayClass = indexDelay > 0 ? `delay-${indexDelay}` : '';

    return `
        <article class="initiative-card reveal ${animDelayClass}" ${delayStyle}>
            <div class="card-link" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; height:100%;">
                <div class="card-image" aria-hidden="true" style="background: ${opp.bgGradient};">
                    <div class="card-icon-overlay" style="color: ${opp.iconColor};">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${opp.mainIcon}
                        </svg>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${opp.title}</h3>
                    <p>${opp.description}</p>
                    <span class="tag">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${opp.tagIcon}
                        </svg>
                        ${opp.dateStr}
                    </span>
                    <span class="tag" style="margin-top: 8px; background:var(--white); border-color:var(--sky-200); color:var(--ink-700);">
                        ${opp.category}
                    </span>
                    <div style="border-top: 1px solid rgba(15,31,43,0.05); padding-top: 16px; margin-top: 16px;">
                        <button onclick="this.closest('article').remove();" class="btn" style="width: 100%; height: 40px; border-radius: 999px; font-weight: 600; cursor: pointer; border: 1px solid #fca5a5; background: #fee2e2; color: #ef4444; transition: 0.3s; z-index: 10; position: relative;">Remove Opportunity</button>
                    </div>
                </div>
            </div>
        </article>
    `;
};
  </script>
"""
    html = html.replace('<script src="js/opportunities_data.js"></script>', '<script src="js/opportunities_data.js"></script>' + override_script)

    with open(admin_opp_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("Successfully built admin-manage-opportunities.html by cloning opportunities.html")

if __name__ == "__main__":
    process()
