import re

admin_files = [
    'admin-home.html',
    'admin-manage-users.html',
    'admin-manage-opportunities.html',
    'admin-system-settings.html',
    'admin-user-profile.html'
]

new_notif = '''<div class="notif-dropdown" id="notifDropdown">
              <div class="notif-header">
                <h4>System Alerts</h4>
                <span class="notif-clear">Mark all read</span>
              </div>
              <div class="notif-item">
                <p><strong>Action Log:</strong> "Summer Internship" post was successfully removed.</p>
              </div>
              <div class="notif-item">
                <p><strong>Access Request:</strong> 2 users have requested "Head of Department" permissions.</p>
                <div class="notif-actions">
                  <a href="admin-manage-users.html" class="btn btn-sky" style="height:32px; padding:0 16px; font-size:0.8rem; text-decoration:none;">Review</a>
                </div>
              </div>
              <div class="notif-item">
                <p><strong>System Reminder:</strong> Weekly data backup completed successfully.</p>
              </div>
            </div>'''

for file in admin_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update notifications
        content = re.sub(r'<div class="notif-dropdown" id="notifDropdown">([\s\S]*?)</div>\s*</div>', new_notif + '\\n          </div>', content)

        if file == 'admin-home.html':
            # Add Admin Profile to Quick Actions
            new_card = '''<a class="opp-card tilt-card" href="admin-user-profile.html">
                    <div class="opp-icon" style="background:#fefce8; color:#eab308; border-color:#fef08a;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h3>Admin Profile</h3>
                    <p>View your governance stats, team details, and contact info.</p>
                </a>
            </div>'''
            if 'admin-user-profile.html' not in content:
                content = content.replace('</a>\\n            </div>\\n        </section>', '</a>\\n                ' + new_card + '\\n        </section>')

        elif file == 'admin-user-profile.html':
            # Remove Permission Matrix
            content = re.sub(r'<h2 class="section-title">Role Permissions</h2>([\s\S]*?)<div class="permission-matrix">([\s\S]*?)</div>', '', content)

        elif file == 'admin-manage-users.html':
            # Update Role capabilities mapping
            cap_html = '''<h2 class="section-title">Role Capabilities</h2>
            <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05); margin-bottom: 40px; display:flex; gap: 20px;">
                <div style="flex:1; padding: 16px; background: var(--sky-50); border-radius: var(--radius-md);">
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">Student</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-700);"><strong>Post</strong> &amp; <strong>Apply</strong></p>
                </div>
                <div style="flex:1; padding: 16px; background: var(--sky-50); border-radius: var(--radius-md);">
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">Employee</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-700);"><strong>Apply</strong> only</p>
                </div>
                <div style="flex:1; padding: 16px; background: var(--sky-50); border-radius: var(--radius-md);">
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">Head of Department</h3>
                    <p style="font-size: 0.9rem; color: var(--ink-700);"><strong>Post</strong> only</p>
                </div>
            </div>'''
            content = re.sub(r'<h2 class="section-title">Platform Access Levels</h2>([\s\S]*?)<div class="permission-matrix">([\s\S]*?)</div>', cap_html, content)

            # Update User Table Columns: Replace "Status" with "More permissions requested"
            content = content.replace('<th>Status</th>', '<th>Permissions Requested</th>')
            content = content.replace('<span style="background: #ecfdf5; color: #10b981; padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Active</span>', '<span style="color: var(--ink-500); font-weight: 500;">No</span>')
            content = content.replace('<span style="background: #fefce8; color: #eab308; padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">Pending</span>', '<span style="color: #eab308; font-weight: 600; display:flex; align-items:center; gap: 6px;">Yes <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>')

        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Updated {file}")
    except Exception as e:
        print(f"Error processing {file}: {e}")
