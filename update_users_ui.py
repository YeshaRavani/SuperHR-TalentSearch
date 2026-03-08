import re

def main():
    with open("admin-manage-users.html", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update the CSS for the new Header
    # Remove old .profile, .notif-dropdown CSS to avoid conflict
    content = re.sub(r'\.notif-dropdown\s*\{[^}]+\}', '', content)
    
    custom_css = """
        * { box-sizing: border-box; }
        .page-container {
            width: min(1200px, 100% - 48px);
            margin-inline: auto;
        }
        
        /* New Header Styles */
        .topbar {
            position: sticky;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 50;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-bottom: 1px solid rgba(15, 31, 43, 0.05);
            box-shadow: var(--shadow-sm);
        }
        .nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 80px;
        }

        /* Profile Button */
        .profile {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid rgba(15, 31, 43, 0.08);
            display: grid;
            place-items: center;
            background: var(--white);
            box-shadow: var(--shadow-sm);
            transition: all var(--transition-bounce);
            text-decoration: none;
        }
        .profile:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
            border-color: var(--sky-200);
        }

        /* Notification Dropdown */
        .notif-wrapper {
            position: relative;
        }
        .notif-dropdown {
            position: absolute;
            top: calc(100% + 16px);
            right: 0;
            width: 380px;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: var(--radius-lg);
            padding: 24px;
            box-shadow: var(--shadow-lg);
            border: 1px solid rgba(15, 31, 43, 0.08);
            transform: translateY(15px) scale(0.95);
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-bounce);
            transform-origin: top right;
            z-index: 100;
        }
        .notif-dropdown.active {
            transform: translateY(0) scale(1);
            opacity: 1;
            visibility: visible;
        }
        .notif-item {
            padding: 16px;
            background: var(--sky-50);
            border-radius: var(--radius-md);
            margin-bottom: 12px;
            border: 1px solid var(--sky-100);
            transition: all 0.2s;
        }
        .notif-item:hover {
            background: var(--sky-100);
            transform: translateX(5px);
        }

        /* Prevent table overflow */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
        }
        
        .role-policy-card {
            background: var(--white);
            border-radius: var(--radius-md);
            padding: 24px;
            margin-bottom: 16px;
            border: 1px solid rgba(15, 31, 43, 0.05);
            box-shadow: var(--shadow-sm);
        }

        @media (max-width: 768px) {
            .nav .menu {
                display: none;
            }
            .notif-dropdown {
                position: fixed;
                top: 70px;
                right: 16px;
                width: calc(100vw - 32px);
            }
        }
"""
    if "/* New Header Styles */" not in content:
        content = content.replace("</style>", custom_css + "\n</style>")

    # 2. Replace Header HTML
    new_header = """    <!-- 1. Header Block -->
    <header class="topbar" id="navbar">
        <div class="page-container nav">
            <div class="logo">
                <img class="logo-img" src="logo.png" onerror="this.src='https://via.placeholder.com/88/9ecae1/ffffff?text=TS'" alt="Logo" />
                Talent Search
            </div>
            <nav class="menu">
                <a href="admin-home.html">Home</a>
                <a href="admin-manage-users.html" class="active">Manage Users</a>
                <a href="admin-manage-opportunities.html">Manage Opportunities</a>
                <a href="admin-system-settings.html">System Settings</a>
            </nav>
            <div class="nav-actions">
                <div class="notif-wrapper">
                    <button class="icon-btn" id="notifToggle">
                        <span class="icon-dot"></span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>
                    <!-- Notification Hidden Dropdown Panel -->
                    <div class="notif-dropdown" id="notifDropdown">
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
                                <a href="admin-manage-users.html" class="btn btn-sky" style="height:32px; padding:0 16px; font-size:0.8rem; text-decoration:none;">Review Access Logs</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Profile Icon -->
                <a href="admin-user-profile.html" class="profile" title="Admin Profile">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--sky-600)" stroke-width="2" style="width:20px; height:20px;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </a>
            </div>
        </div>
    </header>"""
    
    content = re.sub(r'<header class="topbar" id="navbar">.*?</header>', new_header, content, flags=re.DOTALL)

    # 3. Replace the User List Table
    new_table = """        <div class="table-responsive" style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05); margin-bottom: 40px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--sky-100); color: var(--ink-700);">
                        <th style="padding: 16px; font-weight: 600;">User Name</th>
                        <th style="padding: 16px; font-weight: 600;">Current Role</th>
                        <th style="padding: 16px; font-weight: 600;">Permission Request</th>
                        <th style="padding: 16px; font-weight: 600;">Requested Permission</th>
                        <th style="padding: 16px; font-weight: 600; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody style="color: var(--ink-800);">
                    <tr style="border-bottom: 1px solid var(--sky-50);">
                        <td style="padding: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="min-width: 40px; height: 40px; border-radius: 50%; background: var(--sky-200); display: grid; place-items: center; font-weight: 700; color: var(--sky-600);">JD</div>
                            <div>
                                <div style="font-weight: 600;">John Doe</div>
                                <div style="font-size: 0.85rem; color: var(--ink-500);">john.doe@example.com</div>
                            </div>
                        </td>
                        <td style="padding: 16px;">
                            <select class="text-input" style="padding: 6px 10px; width: 140px; font-size: 0.9rem;">
                                <option>Student</option>
                                <option selected>Employee</option>
                                <option>Head of Department</option>
                            </select>
                        </td>
                        <td style="padding: 16px;"><span style="color: var(--ink-500); font-weight: 500;">No</span></td>
                        <td style="padding: 16px;"><span style="color: var(--ink-400);">--</span></td>
                        <td style="padding: 16px; text-align: right;">
                            <button class="btn btn-secondary" style="height: 32px; padding: 0 12px; font-size: 0.8rem; margin-right: 8px;">View Note</button>
                            <button class="btn" style="height: 32px; padding: 0 12px; font-size: 0.8rem; background: #fee2e2; color: #ef4444;">Remove</button>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--sky-50);">
                        <td style="padding: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="min-width: 40px; height: 40px; border-radius: 50%; background: var(--sky-200); display: grid; place-items: center; font-weight: 700; color: var(--sky-600);">AS</div>
                            <div>
                                <div style="font-weight: 600;">Alice Smith</div>
                                <div style="font-size: 0.85rem; color: var(--ink-500);">alice.smith@example.com</div>
                            </div>
                        </td>
                        <td style="padding: 16px;">
                            <select class="text-input" style="padding: 6px 10px; width: 140px; font-size: 0.9rem;">
                                <option>Student</option>
                                <option>Employee</option>
                                <option selected>Head of Department</option>
                            </select>
                        </td>
                        <td style="padding: 16px;"><span style="color: var(--ink-500); font-weight: 500;">No</span></td>
                        <td style="padding: 16px;"><span style="color: var(--ink-400);">--</span></td>
                        <td style="padding: 16px; text-align: right;">
                            <button class="btn btn-secondary" style="height: 32px; padding: 0 12px; font-size: 0.8rem; margin-right: 8px;">View Note</button>
                            <button class="btn" style="height: 32px; padding: 0 12px; font-size: 0.8rem; background: #fee2e2; color: #ef4444;">Remove</button>
                        </td>
                    </tr>
                    
                    <!-- NEW ROW For Permission Request -->
                    <tr style="border-bottom: 1px solid var(--sky-50); background: #fdf8f6;">
                        <td style="padding: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="min-width: 40px; height: 40px; border-radius: 50%; background: #fed7aa; display: grid; place-items: center; font-weight: 700; color: #c2410c;">ML</div>
                            <div>
                                <div style="font-weight: 600;">Mark Lee</div>
                                <div style="font-size: 0.85rem; color: var(--ink-500);">mark.lee@example.com</div>
                            </div>
                        </td>
                        <td style="padding: 16px;">
                            <select class="text-input" style="padding: 6px 10px; width: 140px; font-size: 0.9rem;">
                                <option selected>Student</option>
                                <option>Employee</option>
                                <option>Head of Department</option>
                            </select>
                        </td>
                        <td style="padding: 16px;"><span style="color: #c2410c; font-weight: 700; background: #ffedd5; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Pending</span></td>
                        <td style="padding: 16px; font-weight: 600;">Head of Department</td>
                        <td style="padding: 16px; text-align: right;">
                            <button class="btn btn-sky" style="height: 32px; padding: 0 12px; font-size: 0.8rem; margin-right: 8px;">Approve</button>
                            <button class="btn btn-secondary" style="height: 32px; padding: 0 12px; font-size: 0.8rem;">Not Approve</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>"""
    
    content = re.sub(r'<div style="background: var\(--white\); border-radius: var\(--radius-lg\); padding: 24px; box-shadow: var\(--shadow-sm\); border: 1px solid rgba\(15, 31, 43, 0\.05\); overflow-x: auto; margin-bottom: 40px;">.*?</div>\s*<h2 style="font-size: 1\.5rem; font-weight: 700; margin-bottom: 20px;">Role Capabilities</h2>\s*<div style="background: var\(--white\); border-radius: var\(--radius-lg\); padding: 24px; box-shadow: var\(--shadow-sm\); border: 1px solid rgba\(15, 31, 43, 0\.05\); margin-bottom: 40px; display:flex; gap: 20px;">.*?</div>', new_table + "\n        <!-- POLICY LIST HERE -->", content, flags=re.DOTALL)


    # 4. Replace Role capabilities with formal vertical ones
    new_policy = """        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 24px;">Role Policy</h2>
        <div style="display: flex; flex-direction: column; max-width: 1000px;">
            <div class="role-policy-card">
                <h3 style="font-size: 1.25rem; margin-bottom: 12px; color: var(--ink-900);">Student</h3>
                <p style="font-size: 1rem; color: var(--ink-700); line-height: 1.6;">
                    Currently authorized to <strong>post opportunities</strong> and <strong>apply to opportunities</strong> across the platform. This role maintains default engagement interactions without administrative overrides.
                </p>
            </div>
            <div class="role-policy-card">
                <h3 style="font-size: 1.25rem; margin-bottom: 12px; color: var(--ink-900);">Employee</h3>
                <p style="font-size: 1rem; color: var(--ink-700); line-height: 1.6;">
                    Currently authorized to <strong>apply to opportunities</strong> only. This role restricts the creation of new platform content while enabling active participation in existing assignments.
                </p>
            </div>
            <div class="role-policy-card">
                <h3 style="font-size: 1.25rem; margin-bottom: 12px; color: var(--ink-900);">Head of Department</h3>
                <p style="font-size: 1rem; color: var(--ink-700); line-height: 1.6;">
                    Currently authorized to <strong>post opportunities</strong> only. This role focuses purely on generating and managing organizational engagements without direct participant application capabilities.
                </p>
            </div>
        </div>"""
        
    content = content.replace("<!-- POLICY LIST HERE -->", new_policy)

    # Make sure <main> has page-container class 
    content = re.sub(r'<main class="container"', '<main class="page-container"', content)

    with open("admin-manage-users.html", "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
