import re

def update_file(filepath, active_link, main_content):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Update navbar
    nav_pattern = r'(<nav class="menu">)([\s\S]*?)(</nav>)'
    
    new_nav = '''\\1
                <a href="admin-home.html">Home</a>
                <a href="admin-manage-users.html"{users_active}>Manage Users</a>
                <a href="admin-manage-opportunities.html"{opps_active}>Manage Opportunities</a>
                <a href="admin-system-settings.html"{settings_active}>System Settings</a>
            \\3'''
    
    users_active = ' class="active"' if active_link == 'users' else ''
    opps_active = ' class="active"' if active_link == 'opps' else ''
    settings_active = ' class="active"' if active_link == 'settings' else ''
    
    new_nav = new_nav.format(users_active=users_active, opps_active=opps_active, settings_active=settings_active)
    
    content = re.sub(nav_pattern, new_nav, content)
    
    # Update main content
    main_pattern = r'<main>[\s\S]*?</main>'
    content = re.sub(main_pattern, main_content, content)
    
    with open(filepath, 'w') as f:
        f.write(content)

# Opportunities Main
opp_main = """    <main class="container" style="max-width: 1200px; padding-top: 100px; margin: 0 auto; min-height: 80vh;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <div>
                <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--ink-900);">Manage Opportunities</h1>
                <p style="color: var(--ink-500);">Review and moderate newly posted opportunities across the platform.</p>
            </div>
            <div style="display: flex; gap: 10px; background: rgba(15, 31, 43, 0.05); padding: 4px; border-radius: var(--radius-lg);">
                <button class="btn btn-primary" style="height: 36px; padding: 0 16px; font-size: 0.9rem;">Pending</button>
                <button class="btn btn-secondary" style="height: 36px; padding: 0 16px; font-size: 0.9rem; background: transparent; border-color: transparent;">Approved</button>
                <button class="btn btn-secondary" style="height: 36px; padding: 0 16px; font-size: 0.9rem; background: transparent; border-color: transparent;">Removed</button>
            </div>
        </div>

        <div style="display: grid; gap: 20px;">
            <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05); display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span style="background: #fefce8; color: #eab308; padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Pending Review</span>
                        <span style="font-size: 0.85rem; color: var(--ink-500);">Posted 2 hours ago by <strong>Alice Smith</strong> (Marketing)</span>
                    </div>
                    <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--ink-900); margin-bottom: 8px;">Summer Marketing Internship</h3>
                    <p style="font-size: 0.95rem; color: var(--ink-600); max-width: 800px; margin-bottom: 16px;">We are looking for an energetic intern to join our summer marketing campaign. Responsibilities include social media coordination and event planning.</p>
                    <div style="display: flex; gap: 8px;">
                        <span style="display: inline-block; padding: 4px 12px; background: var(--sky-50); color: var(--sky-600); border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Marketing</span>
                        <span style="display: inline-block; padding: 4px 12px; background: var(--sky-50); color: var(--sky-600); border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Paid</span>
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sky" style="height: 40px; padding: 0 20px;">Approve</button>
                    <button class="btn" style="height: 40px; padding: 0 20px; background: #fee2e2; color: #ef4444;">Remove</button>
                </div>
            </div>

            <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05); display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span style="background: #fefce8; color: #eab308; padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Pending Review</span>
                        <span style="font-size: 0.85rem; color: var(--ink-500);">Posted 5 hours ago by <strong>Dr. Alan Grant</strong> (Research)</span>
                    </div>
                    <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--ink-900); margin-bottom: 8px;">Paleontology Research Assistant</h3>
                    <p style="font-size: 0.95rem; color: var(--ink-600); max-width: 800px; margin-bottom: 16px;">Looking for two rigorous research assistants to help catalog fossil findings from the recent dig site over the upcoming semester.</p>
                    <div style="display: flex; gap: 8px;">
                        <span style="display: inline-block; padding: 4px 12px; background: var(--sky-50); color: var(--sky-600); border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Research</span>
                        <span style="display: inline-block; padding: 4px 12px; background: var(--sky-50); color: var(--sky-600); border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Academic Credit</span>
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sky" style="height: 40px; padding: 0 20px;">Approve</button>
                    <button class="btn" style="height: 40px; padding: 0 20px; background: #fee2e2; color: #ef4444;">Remove</button>
                </div>
            </div>
        </div>
    </main>"""

# Settings Main
settings_main = """    <main class="container" style="max-width: 1000px; padding-top: 100px; margin: 0 auto; min-height: 80vh;">
        <div style="margin-bottom: 40px;">
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--ink-900);">System Settings</h1>
            <p style="color: var(--ink-500);">Configure global platform parameters, security, and policies.</p>
        </div>

        <!-- Global Settings -->
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 20px;">Platform Configuration</h2>
        <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05); margin-bottom: 40px; display: grid; gap: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--sky-50); padding-bottom: 16px;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--ink-800);">Maintenance Mode</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-500);">Temporarily disable access to all non-admin users for system updates.</p>
                </div>
                <label style="position: relative; display: inline-block; width: 50px; height: 28px;">
                    <input type="checkbox" style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; border-radius: 34px; transition: .4s;">
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; border-radius: 50%; transition: .4s;"></span>
                    </span>
                </label>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--sky-50); padding-bottom: 16px;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--ink-800);">Auto-Approve Opportunities</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-500);">Automatically approve opportunities posted by Head of Department roles.</p>
                </div>
                <label style="position: relative; display: inline-block; width: 50px; height: 28px;">
                    <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--sky-500); border-radius: 34px; transition: .4s;">
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 26px; bottom: 4px; background-color: white; border-radius: 50%; transition: .4s;"></span>
                    </span>
                </label>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--ink-800);">Allow Public Profiles</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-500);">Let users make their academic and professional profiles visible to recruiters outside the organisation.</p>
                </div>
                <label style="position: relative; display: inline-block; width: 50px; height: 28px;">
                    <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--sky-500); border-radius: 34px; transition: .4s;">
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 26px; bottom: 4px; background-color: white; border-radius: 50%; transition: .4s;"></span>
                    </span>
                </label>
            </div>
        </div>

        <!-- Security & Access -->
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 20px;">Security & Access</h2>
        <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05); margin-bottom: 40px; display: grid; gap: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--sky-50); padding-bottom: 16px;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--ink-800);">Two-Factor Authentication (2FA)</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-500);">Require 2FA for all admin and department head logins.</p>
                </div>
                <label style="position: relative; display: inline-block; width: 50px; height: 28px;">
                    <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--sky-500); border-radius: 34px; transition: .4s;">
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 26px; bottom: 4px; background-color: white; border-radius: 50%; transition: .4s;"></span>
                    </span>
                </label>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--ink-800);">Session Timeout</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-500);">Automatically log out inactive users after a set period.</p>
                </div>
                <select class="text-input" style="padding: 8px 12px; width: 160px; font-size: 0.9rem;">
                    <option>15 Minutes</option>
                    <option selected>30 Minutes</option>
                    <option>1 Hour</option>
                    <option>Never</option>
                </select>
            </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; padding-bottom: 60px;">
            <button class="btn btn-sky" style="height: 48px; padding: 0 32px; font-size: 1rem;">Save All Settings</button>
        </div>
    </main>"""

update_file('/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-opportunities.html', 'opps', opp_main)
update_file('/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-system-settings.html', 'settings', settings_main)
print("Finished updates.")
