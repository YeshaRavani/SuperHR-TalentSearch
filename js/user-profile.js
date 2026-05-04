document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('userProfileRoot');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatRole(role) {
        return String(role || 'user').replaceAll('_', ' ');
    }

    function formatDate(value) {
        if (!value) return 'No date';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'No date';
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    function getInitials(user) {
        const name = user.full_name || user.username || user.email || '?';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    }

    function renderBackLink() {
        return `
            <div style="margin-bottom: 24px;">
                <a href="admin-manage-users.html"
                    style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: var(--sky-600); font-weight: 600; font-size: 0.95rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Manage Users
                </a>
            </div>
        `;
    }

    function renderState(title, message) {
        root.innerHTML = `
            ${renderBackLink()}
            <div style="background: var(--white); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                <h1 style="font-size: 1.7rem; font-weight: 800; color: var(--ink-900); margin-bottom: 8px;">${escapeHtml(title)}</h1>
                <p style="color: var(--ink-600); margin: 0;">${escapeHtml(message)}</p>
            </div>
        `;
    }

    function statCard(label, value, color, iconPath) {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--white); border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                <div style="display: flex; align-items: center; gap: 12px; font-weight: 600; color: var(--ink-800);">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: ${color.bg}; color: ${color.fg}; display: grid; place-items: center;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            ${iconPath}
                        </svg>
                    </div>
                    ${escapeHtml(label)}
                </div>
                <div style="font-size: 1.35rem; font-weight: 800; color: var(--ink-900);">${Number(value || 0).toLocaleString('en-IN')}</div>
            </div>
        `;
    }

    function renderSkills(skills) {
        if (!skills.length) {
            return '<p style="color: var(--ink-500); margin: 0;">No skills added yet.</p>';
        }

        return `
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${skills.map((skill) => `
                    <span style="padding: 6px 14px; background: var(--sky-50); color: var(--sky-700); border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${escapeHtml(skill)}</span>
                `).join('')}
            </div>
        `;
    }

    function renderActivity(items) {
        if (!items.length) {
            return '<p style="color: var(--ink-500); margin: 0;">No activity recorded yet.</p>';
        }

        const colors = {
            opportunity: 'var(--sky-500)',
            posted: '#8b5cf6',
            invitation: '#10b981',
        };

        return `
            <ul style="list-style: none; padding: 0; display: grid; gap: 16px;">
                ${items.map((item, index) => `
                    <li style="display: flex; gap: 12px; align-items: flex-start; padding-bottom: ${index === items.length - 1 ? '0' : '12px'}; border-bottom: ${index === items.length - 1 ? '0' : '1px solid rgba(15,31,43,0.03)'};">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${colors[item.category] || 'var(--sky-500)'}; margin-top: 8px; flex: 0 0 auto;"></div>
                        <div>
                            <p style="margin: 0; font-size: 0.95rem; color: var(--ink-700);">${escapeHtml(item.label)}</p>
                            <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--ink-500);">${formatDate(item.created_at)}${item.status ? ` &bull; ${escapeHtml(item.status)}` : ''}</p>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    function renderProfile(data) {
        const user = data.user;
        const stats = data.stats || {};
        const skills = Array.isArray(user.skills) ? user.skills : [];
        const department = user.department_team || 'Unassigned';
        const organisation = user.organisation || 'No organisation';
        const statusLabel = user.is_active ? 'Active' : 'Inactive';
        const joined = formatDate(user.created_at);

        document.title = `${user.full_name || user.username || 'User'} - User Profile`;

        root.innerHTML = `
            ${renderBackLink()}
            <div class="hero-grid">
                <div>
                    <div style="background: var(--white); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-md); border: 1px solid rgba(15,31,43,0.05); margin-bottom: 30px;">
                        <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 20px;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--sky-200); font-size: 2rem; font-weight: 800; color: var(--sky-600); display: grid; place-items: center; box-shadow: var(--shadow-sm);">
                                ${escapeHtml(getInitials(user))}
                            </div>
                            <div>
                                <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--ink-900); margin-bottom: 4px;">${escapeHtml(user.full_name || user.username)}</h1>
                                <p style="color: var(--ink-500); font-size: 1rem;">${escapeHtml(user.email)} &bull; ${escapeHtml(department)}</p>
                            </div>
                        </div>
                        <p style="color: var(--ink-700); line-height: 1.7; font-size: 1.05rem; margin-bottom: 0;">
                            ${escapeHtml(formatRole(user.role))} at ${escapeHtml(organisation)}. Joined ${joined}. Account status: ${statusLabel}.
                        </p>
                    </div>

                    <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05); margin-bottom: 30px;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: var(--ink-900);">Skills</h3>
                        ${renderSkills(skills)}
                    </div>

                    <div style="background: var(--white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(15,31,43,0.05);">
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: var(--ink-900);">Recent Activity</h3>
                        ${renderActivity(data.recent_activity || [])}
                    </div>
                </div>

                <div>
                    <div style="background: var(--white); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-md); border: 1px solid rgba(15, 31, 43, 0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(15,31,43,0.05); padding-bottom: 16px;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--ink-900);">User Overview</h3>
                            <span style="font-size: 0.8rem; font-weight: 700; color: ${user.is_active ? '#059669' : '#ef4444'};">${statusLabel}</span>
                        </div>
                        <div style="display: grid; gap: 16px;">
                            ${statCard('Applied Items', stats.applied_items, { bg: 'var(--sky-50)', fg: 'var(--sky-600)' }, '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>')}
                            ${statCard('Interested Items', stats.interested_items, { bg: '#eef2ff', fg: '#4f46e5' }, '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>')}
                            ${statCard('Posted Items', stats.posted_items, { bg: '#e0f2fe', fg: '#0284c7' }, '<path d="M12 5v14M5 12h14"></path>')}
                            ${statCard('Participated', stats.participated_items, { bg: '#fef3c7', fg: '#d97706' }, '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>')}
                            ${statCard('Collaborations', stats.collaborations, { bg: '#d1fae5', fg: '#059669' }, '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>')}
                            ${statCard('Reward Points', user.total_points, { bg: '#fce7f3', fg: '#db2777' }, '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"></path>')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (!userId) {
        renderState('No user selected', 'Open a profile from Manage Users so this page can load the selected account.');
        return;
    }

    renderState('Loading user profile', 'Fetching profile details from the backend.');

    try {
        const data = await window.api.get(`/admin/users/${encodeURIComponent(userId)}/profile`);
        renderProfile(data);
    } catch (err) {
        console.error('Failed to load user profile:', err);
        renderState('Unable to load profile', err.message || 'The selected user profile could not be loaded.');
    }
});
