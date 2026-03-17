import re

def main():
    # Read the existing file to extract unique content if needed, but we can also just rewrite it entirely.
    # It's safer to just write the specific structure required.

    with open("admin-home.html", "r", encoding="utf-8") as f:
        content = f.read()

    # Extract the original CSS from the <style> tag so we can clean and reuse it, or just provide a clean one.
    style_match = re.search(r'<style>([\s\S]*?)</style>', content)
    styles = style_match.group(1) if style_match else ""

    # Clean the `\n` syntax error I accidentally introduced
    styles = styles.replace("\\n", "\n")
    
    # Clean up any bad hero/dashboard widget CSS that was left over
    styles = re.sub(r'\.dashboard-widget\s*\{[^}]+\}', '', styles)
    styles = re.sub(r'\.hero\s*\{[^}]+\}', '', styles)
    styles = re.sub(r'\.hero-grid\s*\{[^}]+\}', '', styles)

    # Clean up absolute positioning or constraints that cause overlap
    styles = re.sub(r'\.notif-dropdown\s*\{[^}]+\}', '', styles)  # Drop the old one, we will inject a new clean one
    styles = re.sub(r'transform-style:\s*preserve-3d;', '', styles)
    styles = re.sub(r'transform:\s*rotateX[^;]+;', '', styles)
    styles = re.sub(r'transform:\s*translateZ[^;]+;', '', styles)
    
    # We will inject a completely clean CSS block for the new layout
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
        
        /* New Hero */
        .hero-section {
            padding: 80px 0;
        }
        .hero-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
            gap: 32px;
            align-items: start;
        }
        .hero-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .hero-title {
            font-size: clamp(3rem, 5vw, 4.5rem);
            font-weight: 900;
            margin-bottom: 24px;
            line-height: 1.05;
        }
        .hero-title span {
            background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .hero-desc {
            font-size: 1.25rem;
            color: var(--ink-500);
            margin-bottom: 40px;
            max-width: 500px;
            line-height: 1.5;
        }
        .dashboard-widget {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,1);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 10px 40px rgba(15,31,43,0.08);
            width: 100%;
            max-width: 100%;
        }

        /* Responsive Fixes */
        .card-grid, .opp-card, .stat-row, img {
            max-width: 100%;
        }
        
        @media (max-width: 1200px) {
            .hero-section {
                padding: 60px 0;
            }
        }
        
        @media (max-width: 1024px) {
            .hero-grid {
                grid-template-columns: 1fr;
            }
            .hero-content {
                align-items: center;
                text-align: center;
                margin: 0 auto;
            }
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

    new_html = """<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Talent & Opportunity Discovery - Admin</title>
    <style>
STYLES_PLACEHOLDER
CUSTOM_CSS_PLACEHOLDER
    </style>
    <link rel="stylesheet" href="css/chatbot.css" />
    <script src="js/opportunities_data.js"></script>
</head>
<body>
    <div class="progress-container">
        <div class="progress-bar-scroll" id="scrollProgress"></div>
    </div>

    <!-- 1. Header Block -->
    <header class="topbar" id="navbar">
        <div class="page-container nav">
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
                <a href="admin-contributor-profile.html" class="profile" title="Admin Profile">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--sky-600)" stroke-width="2" style="width:20px; height:20px;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </a>
            </div>
        </div>
    </header>

    <main>
        <!-- 2. Hero Section (Left + Right KPI) -->
        <section class="hero-section text-ink-900">
            <div class="page-container hero-grid">
                
                <div class="hero-content">
                    <h1 class="hero-title">Admin<br><span>Dashboard</span></h1>
                    <p class="hero-desc">Platform governance, user management, and system-wide analytics.</p>
                    <div class="hero-actions" style="display:flex; gap:16px;">
                        <a href="admin-system-settings.html" class="btn btn-primary" style="height: 48px; padding: 0 24px;">System Settings</a>
                        <a href="admin-manage-users.html" class="btn btn-secondary" style="height: 48px; padding: 0 24px;">Manage Users</a>
                    </div>
                </div>

                <div class="dashboard-widget">
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
                            <div class="stat-value counter" data-target="1245" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900);">0</div>
                        </div>
                        <div class="stat-row" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--white); border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                            <div class="stat-info" style="display: flex; align-items: center; gap: 12px; font-weight: 600;">
                                <div class="stat-icon" style="width: 40px; height: 40px; border-radius: 12px; background: #fefce8; color: #eab308; display: grid; place-items: center;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                </div>
                                Permission Requests
                            </div>
                            <div class="stat-value counter" data-target="14" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900);">0</div>
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
                            <div class="stat-value counter" data-target="324" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900);">0</div>
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
                            <div class="stat-value" style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900);">99.9%</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Analytics & Reports Section -->
        <section class="section reveal" style="background: var(--sky-50); padding: 80px 0;">
            <div class="page-container">
                <div class="section-header" style="text-align: center; margin-bottom: 40px;">
                    <h2 class="section-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 12px;">Analytics & Reports</h2>
                    <p class="section-desc" style="color: var(--ink-500); font-size: 1.1rem;">Platform engagement and growth metrics at a glance.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
                    <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05);">
                        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--ink-800); margin-bottom: 20px;">User Growth (Last 30 Days)</h3>
                        <div style="height: 200px; display: flex; align-items: flex-end; gap: 8px; border-bottom: 2px solid var(--sky-100); padding-bottom: 8px;">
                            <div style="flex: 1; background: var(--sky-200); height: 30%; border-radius: 4px 4px 0 0;"></div>
                            <div style="flex: 1; background: var(--sky-200); height: 45%; border-radius: 4px 4px 0 0;"></div>
                            <div style="flex: 1; background: var(--sky-300); height: 60%; border-radius: 4px 4px 0 0;"></div>
                            <div style="flex: 1; background: var(--sky-400); height: 75%; border-radius: 4px 4px 0 0;"></div>
                            <div style="flex: 1; background: var(--sky-500); height: 85%; border-radius: 4px 4px 0 0;"></div>
                            <div style="flex: 1; background: var(--sky-600); height: 100%; border-radius: 4px 4px 0 0;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.8rem; color: var(--ink-500); font-weight: 600;">
                            <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                        </div>
                    </div>

                    <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15, 31, 43, 0.05);">
                        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--ink-800); margin-bottom: 20px;">Top Departments by Activity</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem; font-weight: 600;">
                                    <span>Engineering</span><span>45%</span>
                                </div>
                                <div style="height: 8px; background: var(--sky-100); border-radius: 999px; overflow: hidden;">
                                    <div style="height: 100%; background: var(--sky-600); width: 45%;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem; font-weight: 600;">
                                    <span>Marketing</span><span>30%</span>
                                </div>
                                <div style="height: 8px; background: var(--sky-100); border-radius: 999px; overflow: hidden;">
                                    <div style="height: 100%; background: var(--sky-500); width: 30%;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem; font-weight: 600;">
                                    <span>Design</span><span>15%</span>
                                </div>
                                <div style="height: 8px; background: var(--sky-100); border-radius: 999px; overflow: hidden;">
                                    <div style="height: 100%; background: var(--sky-400); width: 15%;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem; font-weight: 600;">
                                    <span>Sales</span><span>10%</span>
                                </div>
                                <div style="height: 8px; background: var(--sky-100); border-radius: 999px; overflow: hidden;">
                                    <div style="height: 100%; background: var(--sky-300); width: 10%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Optional Event Gallery -->
        <section class="section reveal" style="padding-bottom:100px; padding-top: 80px;">
            <div class="page-container">
                <div class="section-header" style="text-align: center; margin-bottom: 40px;">
                    <h2 class="section-title">Event Gallery</h2>
                    <p class="section-desc">Swipe through highlights from our latest campus events, mixers, and workshops.</p>
                </div>
            </div>

            <div class="gallery-container">
                <div class="gallery-card">
                    <img src="founder.jpg" alt="Founders Day" onerror="this.src='https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Featured</div>
                    <div class="gallery-overlay">
                        <h3>Founders Day</h3>
                        <p>Celebrate bold ideas and meet project leads.</p>
                    </div>
                </div>
                <div class="gallery-card">
                    <img src="assets/foundation.jpeg" alt="Foundation Day" onerror="this.src='https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Campus</div>
                    <div class="gallery-overlay">
                        <h3>Foundation Day</h3>
                        <p>A showcase of talent stories and growing teams.</p>
                    </div>
                </div>
                <div class="gallery-card">
                    <img src="assets/workshop.jpg" alt="Workshops" onerror="this.src='https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Learning</div>
                    <div class="gallery-overlay">
                        <h3>Workshops</h3>
                        <p>Practical sessions designed for rapid upskilling.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <h2>Talent Search Platform</h2>
        <p style="color:var(--ink-400); margin-top:20px;">Designed to connect talent with right opportunity.</p>
    </footer>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // Scroll Progress
        const scrollProgress = document.getElementById('scrollProgress');
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            scrollProgress.style.width = scrolled + "%";
        });

        // Notification Dropdown Toggle
        const notifToggle = document.getElementById('notifToggle');
        const notifDropdown = document.getElementById('notifDropdown');
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
        });
        window.addEventListener('click', () => {
            if (notifDropdown.classList.contains('active')) notifDropdown.classList.remove('active');
        });
        notifDropdown.addEventListener('click', e => e.stopPropagation());

        // Number Counters
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            counter.innerText = '0';
            const updateCounter = () => {
                const target = +counter.getAttribute('data-target');
                const c = +counter.innerText.replace(/[^0-9]/g, '');
                const increment = target / 50;
                if (c < target) {
                    counter.innerText = Math.ceil(c + increment);
                    setTimeout(updateCounter, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
        
        // RBAC Enforce (Optional basic local rules if applied via component logic)
        const role = localStorage.getItem('userRole');
        if (role === 'employee') {
            document.querySelectorAll('a[href="posted-opportunities.html"], a[href="add-opportunity.html"]').forEach(el => el.style.display = 'none');
        }
    });
    </script>
    <script src="js/chatbot.js"></script>
    <script src="js/role-permissions.js"></script>
</body>
</html>
"""

    new_html = new_html.replace("STYLES_PLACEHOLDER", styles)
    new_html = new_html.replace("CUSTOM_CSS_PLACEHOLDER", custom_css)

    with open("admin-home.html", "w", encoding="utf-8") as f:
        f.write(new_html)

if __name__ == "__main__":
    main()
