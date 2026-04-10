document.addEventListener('DOMContentLoaded', async () => {
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const container = document.getElementById('posted-opportunities-container');

    if (navbar && scrollProgress) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');

            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
            scrollProgress.style.width = scrolled + "%";
        });
    }

    if (container) {
        try {
            const opportunities = await api.get('/my-posted-opportunities');
            if (opportunities.length === 0) {
                container.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">You haven\'t posted any opportunities yet.</div>';
                return;
            }

            container.innerHTML = opportunities.map(opp => renderPostedOpportunity(opp)).join('');
        } catch (err) {
            console.error("Failed to load posted opportunities:", err);
            container.innerHTML = '<div style="padding: 60px; text-align: center; color: red;">Failed to load. Please try logging in as admin.</div>';
        }
    }

    function renderPostedOpportunity(opp) {
        // We lack a backend "applicants" list for now, so we'll show a simplified card.
        // In a real scenario, we'd fetch applicants for this specific ID.
        return `
            <div class="opportunity-card">
                <div class="opportunity-head">
                    <h2 class="opportunity-title">${opp.title}</h2>
                    <div class="opportunity-expires">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${opp.status || 'Active'}
                    </div>
                    <div class="opportunity-meta">
                        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg> ${opp.schedule_time || 'Upcoming'}</span>
                        <span style="background: #fefce8; color: #eab308; border: 1px solid #fef08a;"><svg width="14" height="14"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg> ${opp.points_reward} XP Points</span>
                    </div>
                </div>

                <div class="grid">
                    <div class="panel">
                        <h4>Interested (0)</h4>
                        <p style="color:var(--ink-400); font-size:0.9rem; padding:10px;">No interests yet.</p>
                    </div>
                    <div class="panel">
                        <h4>Enrolled (0)</h4>
                        <p style="color:var(--ink-400); font-size:0.9rem; padding:10px;">No enrollments yet.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Role check
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
        document.body.classList.add('is-admin');
    }
});