import re
import os

def main():
    with open("admin-home.html", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Fix CSS styles for profile and notification dropdown
    # Add .profile class if not present
    if ".profile {" not in content:
        profile_css = """
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
        }

        .profile:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
            border-color: var(--sky-200);
        }
        """
        content = content.replace("/* Notification Dropdown */", profile_css + "\\n        /* Notification Dropdown */")

    # Ensure .notif-dropdown has z-index
    content = re.sub(r'(\.notif-dropdown\s*\{[^}]+transform-origin:\s*top\s+right;)', r'\1\n            z-index: 100;', content)

    # Clean up the hero styles: remove 3D transforms from .dashboard-widget and .stat-row that might cause clipping
    content = re.sub(r'transform-style:\s*preserve-3d;', '', content)
    content = re.sub(r'transform:\s*rotateX[^;]+;', '', content)
    content = re.sub(r'transform:\s*translateZ[^;]+;', '', content)
    
    # Let's completely replace the entire <header> element with a clean one
    new_header = """    <header class="topbar" id="navbar">
        <div class="nav" style="width: 100%; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
            <div class="logo">
                <img class="logo-img" src="assets/logo.png" onerror="this.src='https://via.placeholder.com/88/9ecae1/ffffff?text=TS'" alt="Logo" />
                Talent Search
            </div>
            <nav class="menu">
                <a href="admin-home.html" class="active">Home</a>
                <a href="admin-manage-users.html">Manage Users</a>
                <a href="admin-manage-opportunities.html">Manage Opportunities</a>
                <a href="admin-system-settings.html">System Settings</a>
            </nav>
            <div class="nav-actions">
                <div style="position: relative;">
                    <button class="icon-btn" id="notifToggle">
                        <span class="icon-dot"></span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>
                    <div class="notif-dropdown" id="notifDropdown">
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
                    </div>
                </div>
                <a href="admin-user-profile.html" class="profile" title="Admin Profile">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--sky-600)" stroke-width="2" style="width:20px; height:20px;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </a>
            </div>
        </div>
    </header>"""

    # Replace old header
    content = re.sub(r'<header class="topbar".*?</header>', new_header, content, flags=re.DOTALL)

    # Fix Hero Section
    # Remove parallax JS inline script event listeners if any, we'll keep the DOM clean
    # The existing hero section uses 'id="parallaxWidget"'
    new_hero = """        <section class="hero" style="min-height: unset; padding: 120px 24px 60px; overflow: visible;">
            <div class="hero-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; max-width: 1200px; margin: 0 auto;">
                <div class="hero-content" style="max-width: 500px;">
                    <h1 style="font-size: clamp(2.5rem, 4vw, 3.5rem); margin-bottom: 20px;">Admin<br><span>Dashboard</span></h1>
                    <p style="font-size: 1.15rem; margin-bottom: 30px; color: var(--ink-500);">Platform governance, user management, and system-wide analytics.</p>
                    <div class="hero-actions">
                        <a href="admin-system-settings.html" class="btn btn-primary" style="height: 48px; padding: 0 24px;">
                            System Settings
                        </a>
                    </div>
                </div>

                <div class="hero-visual" style="width: 100%;">
                    <div class="dashboard-widget" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,1); border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px rgba(15,31,43,0.08);">
                        <div class="widget-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(15,31,43,0.05); padding-bottom: 16px;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">Live Pulse Overview</h3>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" stroke-width="2">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                        </div>
                        <div class="stat-grid" style="display: grid; gap: 16px;">
                            <div class="stat-row" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--white); border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                                <div class="stat-info" style="display: flex; align-items: center; gap: 12px; font-weight: 600;">
                                    <div class="stat-icon" style="width: 40px; height: 40px; border-radius: 12px; background: var(--sky-100); color: var(--sky-600); display: grid; place-items: center;">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    </div>
                                    Total Users
                                </div>
                                <div class="stat-value counter" data-target="1245" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900); text-align: right;">0</div>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--white); border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                                <div class="stat-info" style="display: flex; align-items: center; gap: 12px; font-weight: 600;">
                                    <div class="stat-icon" style="width: 40px; height: 40px; border-radius: 12px; background: #fefce8; color: #eab308; display: grid; place-items: center;">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                        </svg>
                                    </div>
                                    Pending Approvals
                                </div>
                                <div class="stat-value counter" data-target="14" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900); text-align: right;">0</div>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--white); border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                                <div class="stat-info" style="display: flex; align-items: center; gap: 12px; font-weight: 600;">
                                    <div class="stat-icon" style="width: 40px; height: 40px; border-radius: 12px; background: #eff6ff; color: #3b82f6; display: grid; place-items: center;">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    </div>
                                    Active Opportunities
                                </div>
                                <div class="stat-value counter" data-target="324" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900); text-align: right;">0</div>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--white); border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                                <div class="stat-info" style="display: flex; align-items: center; gap: 12px; font-weight: 600;">
                                    <div class="stat-icon" style="width: 40px; height: 40px; border-radius: 12px; background: #ecfdf5; color: #10b981; display: grid; place-items: center;">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    </div>
                                    System Health
                                </div>
                                <div class="stat-value" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900); text-align: right;">99.9%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>"""
    content = re.sub(r'<section class="hero".*?</section>', new_hero, content, flags=re.DOTALL)
    
    # Remove parallax js
    content = re.sub(r'const heroSection = document\.querySelector\(\'\.hero\'\);\s+const widget = document\.getElementById\(\'parallaxWidget\'\);.*?widget\.style\.transition = `none`;\s+}\);', '', content, flags=re.DOTALL)

    # Make responsive fixes in CSS
    responsive_css = """
        @media (max-width: 1200px) {
            .nav { padding: 16px; }
            .hero-grid { gap: 30px; }
        }
        @media (max-width: 1024px) {
            .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
            .hero-content { align-items: center; max-width: 100% !important; margin: 0 auto; }
            .hero-actions { justify-content: center; }
            .hero-visual { align-items: center; }
            .nav-actions { gap: 12px; }
        }
        @media (max-width: 768px) {
            .menu { display: none; }
            .notif-dropdown {
                position: fixed;
                top: 70px;
                right: 16px;
                width: calc(100vw - 32px);
            }
        }
    """
    
    # replace existing media queries block if needed or just append
    # The original file has @media blocks starting at line 1155. Let's just append right before </style>
    if "1200px" not in content:
        content = content.replace("</style>", responsive_css + "\\n</style>")

    with open("admin-home.html", "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
