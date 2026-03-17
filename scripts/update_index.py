import re

with open('index (1).html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Hero Text
html = html.replace('<div class="tag">🚀 Welcome to the new platform</div>', '')
html = html.replace('<h1>Unlock Potential,<br><span>Discover Talent.</span></h1>', '<h1>Welcome to<br><span>Talent Search</span></h1>')
html = html.replace(
'''<p>Join a dynamic ecosystem of creators and builders. Explore short-term initiatives, hands-on
                        workshops, and connect with peers to build something extraordinary.</p>''',
'''<p>Discover and contribute to short-term opportunities designed for collaboration, experimentation, and shared success.</p>'''
)
hero_actions = '''<div class="hero-actions">
                        <a href="initiatives.html" class="btn btn-primary">
                            Explore Opportunities
                        </a>
                        <a href="login.html" class="btn btn-secondary">
                            Join Community
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>'''
new_hero_actions = '''<div class="hero-actions">
                        <a href="login.html" class="btn btn-primary">
                            Get Involved
                        </a>
                    </div>'''
html = html.replace(hero_actions, new_hero_actions)

# 2. Hero Visual (Live Pulse)
old_stats = '''<div class="stat-grid">
                            <div class="stat-row">
                                <div class="stat-info">
                                    <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" width="24" height="24">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg></div>
                                    New Collaborations
                                </div>
                                <div class="stat-value counter" data-target="156">0</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-info">
                                    <div class="stat-icon" style="background:#fefce8; color:#eab308;"><svg
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            width="24" height="24">
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                        </svg></div>
                                    Active Initiatives
                                </div>
                                <div class="stat-value counter" data-target="42">0</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-info">
                                    <div class="stat-icon" style="background:var(--ink-900); color:var(--white);"><svg
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            width="24" height="24">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg></div>
                                    Upcoming Events
                                </div>
                                <div class="stat-value counter" data-target="18">0</div>
                            </div>
                        </div>'''

new_stats = '''<div class="stat-grid">
                            <div class="stat-row">
                                <div class="stat-info">
                                    <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" width="24" height="24">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg></div>
                                    New collaboration invites
                                </div>
                                <div class="stat-value counter" data-target="8">0</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-info">
                                    <div class="stat-icon" style="background:#fefce8; color:#eab308;"><svg
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            width="24" height="24">
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                        </svg></div>
                                    Active short-term roles
                                </div>
                                <div class="stat-value counter" data-target="22">0</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-info">
                                    <div class="stat-icon" style="background:#eff6ff; color:#3b82f6;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg></div>
                                    Upcoming workshops
                                </div>
                                <div class="stat-value counter" data-target="5">0</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-info">
                                    <div class="stat-icon" style="background:var(--ink-900); color:var(--white);"><svg
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            width="24" height="24">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg></div>
                                    Events this month
                                </div>
                                <div class="stat-value counter" data-target="4">0</div>
                            </div>
                        </div>'''
html = html.replace(old_stats, new_stats)

# 3. Remove Platform Activity Feed
import re
html = re.sub(r'<!-- Live Activity Feed -->.*?(?=<!-- Opportunities Cards -->)', '', html, flags=re.DOTALL)

# 4. Explore Opportunities section header and descriptions
html = html.replace('<h2 class="section-title">Explore Pathways</h2>', '<h2 class="section-title">Explore opportunities</h2>')
html = html.replace('''<p class="section-desc">Find your next big thing. Connect, build, learn, and grow through diverse
                    opportunities.</p>''', '')

# Replace text inside the cards
html = html.replace('''<h3>Initiatives</h3>
                    <p>Join fast-moving, cross-functional projects. Contribute your skills to build real-world products.
                    </p>
                    <div class="card-arrow">View Projects &rarr;</div>''', 
'''<div class="pill" style="display:inline-flex; align-items:center; gap:8px; font-size:0.85rem; padding:6px 12px; border-radius:999px; background:var(--sky-100); color:var(--ink-700); width:fit-content; margin-bottom:12px; font-weight: 600;">Community</div>
                    <h3>Initiatives</h3>
                    <p>Join cross-functional projects that move quickly.</p>''')

html = html.replace('''<h3>Workshops</h3>
                    <p>Elevate your craft securely. Engage in hands-on, expert-led practical upskilling sessions.</p>
                    <div class="card-arrow" style="color:#3b82f6;">Join Sessions &rarr;</div>''',
'''<div class="pill" style="display:inline-flex; align-items:center; gap:8px; font-size:0.85rem; padding:6px 12px; border-radius:999px; background:var(--sky-100); color:var(--ink-700); width:fit-content; margin-bottom:12px; font-weight: 600;">Skill building</div>
                    <h3>Workshops</h3>
                    <p>Learn together with hands-on, practical sessions.</p>''')


html = html.replace('''<h3>Events</h3>
                    <p>Network, learn, and grow. Connect with peers at our town halls, demo days, and mixers.</p>
                    <div class="card-arrow" style="color:#eab308;">See Calendar &rarr;</div>''',
'''<div class="pill" style="display:inline-flex; align-items:center; gap:8px; font-size:0.85rem; padding:6px 12px; border-radius:999px; background:var(--sky-100); color:var(--ink-700); width:fit-content; margin-bottom:12px; font-weight: 600;">Gatherings</div>
                    <h3>Events</h3>
                    <p>Connect with peers and discover shared interests.</p>''')

html = html.replace('''<h3>1:1 Mentorship</h3>
                    <p>Accelerate your growth. Schedule personalized syncs with opportunity guides and mentors.</p>
                    <div class="card-arrow" style="color:#22c55e;">Book Appointment &rarr;</div>''',
'''<div class="pill" style="display:inline-flex; align-items:center; gap:8px; font-size:0.85rem; padding:6px 12px; border-radius:999px; background:var(--sky-100); color:var(--ink-700); width:fit-content; margin-bottom:12px; font-weight: 600;">Personalized</div>
                    <h3>Book an Appointment</h3>
                    <p>Schedule time with mentors and opportunity guides.</p>''')

# 5. Incentive Gamified Section
html = html.replace('<h2 class="section-title">Your Rewards</h2>', '<h2 class="section-title">Incentive</h2>')
html = html.replace('''<p class="section-desc">Contribute to the platform, complete modules, and engage in initiatives to level
                    up and unlock exclusive perks.</p>''', 
'''<p class="section-desc">Earn points by contributing to initiatives, participating in events, and collaborating across teams.</p>''')

# 6. Event Gallery
html = html.replace('<h2 class="section-title">Moments Captured</h2>', '<h2 class="section-title">Event Gallery</h2>')

card1 = '''<div class="gallery-card">
                    <img src="founder.jpg" alt="Founders Day"
                        onerror="this.src='https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Featured Event</div>
                    <div class="gallery-overlay">
                        <h3>Founders Day 2026</h3>
                        <p>Celebrating the bold ideas shaping our future.</p>
                    </div>
                </div>'''
card1_rep = '''<div class="gallery-card">
                    <img src="founder.jpg" alt="Founders Day"
                        onerror="this.src='https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Featured</div>
                    <div class="gallery-overlay">
                        <h3>Founders Day</h3>
                        <p>Celebrate bold ideas and meet project leads.</p>
                    </div>
                </div>'''

card2 = '''<div class="gallery-card">
                    <img src="assets/foundation.jpeg" alt="Foundation Day"
                        onerror="this.src='https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Campus Life</div>
                    <div class="gallery-overlay">
                        <h3>Foundation Gala</h3>
                        <p>A night honoring top campus contributors.</p>
                    </div>
                </div>'''
card2_rep = '''<div class="gallery-card">
                    <img src="assets/foundation.jpeg" alt="Foundation Day"
                        onerror="this.src='https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Campus</div>
                    <div class="gallery-overlay">
                        <h3>Foundation Day</h3>
                        <p>A showcase of talent stories and growing teams.</p>
                    </div>
                </div>'''
                
card3 = '''<div class="gallery-card">
                    <img src="assets/workshop.jpg" alt="Workshop"
                        onerror="this.src='https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Hands-on Learning</div>
                    <div class="gallery-overlay">
                        <h3>Design Systems 101</h3>
                        <p>Practical sessions on building scalable UI.</p>
                    </div>
                </div>'''
card3_rep = '''<div class="gallery-card">
                    <img src="assets/workshop.jpg" alt="Workshops"
                        onerror="this.src='https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Learning</div>
                    <div class="gallery-overlay">
                        <h3>Workshops</h3>
                        <p>Practical sessions designed for rapid upskilling.</p>
                    </div>
                </div>'''

card4 = '''<div class="gallery-card">
                    <img src="mixer.jpg" alt="Mixer"
                        onerror="this.src='https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=600'" />
                    <div class="tag-anim">Networking</div>
                    <div class="gallery-overlay">
                        <h3>Tech Mixer Friday</h3>
                        <p>Casual conversations with industry leaders.</p>
                    </div>
                </div>'''
card4_rep = ''

html = html.replace(card1, card1_rep)
html = html.replace(card2, card2_rep)
html = html.replace(card3, card3_rep)
html = html.replace(card4, card4_rep)

with open('index (1).html', 'w', encoding='utf-8') as f:
    f.write(html)
