document.addEventListener('DOMContentLoaded', async () => {
    const welcomeText = document.getElementById('welcome-text');
    const activityGrid = document.getElementById('dashboardActivityGrid');
    const inviteCountEl = document.getElementById('dashInviteCount');
    const activeProjectCountEl = document.getElementById('dashActiveProjectCount');
    const workshopCountEl = document.getElementById('dashWorkshopCount');
    const eventCountEl = document.getElementById('dashEventCount');

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function setText(element, value) {
        if (element) element.textContent = Number(value || 0).toLocaleString('en-IN');
    }

    function detailPageForOpportunity(opp) {
        const type = String(opp?.type || '').toLowerCase();
        if (type === 'workshop') return `workshop-detail.html?id=${encodeURIComponent(opp.id)}`;
        if (type === 'event') return `event-detail.html?id=${encodeURIComponent(opp.id)}`;
        return `initiative-detail.html?id=${encodeURIComponent(opp.id)}`;
    }

    function isThisMonth(schedule) {
        if (!schedule) return true;
        const parsed = new Date(schedule);
        if (Number.isNaN(parsed.getTime())) return true;
        const now = new Date();
        return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
    }

    function renderActivityItem(item) {
        const href = item.href || '#';
        const tag = href === '#' ? 'div' : 'a';
        const linkAttrs = href === '#'
            ? ''
            : `href="${escapeHtml(href)}" style="text-decoration:none; color:inherit;"`;

        return `
            <${tag} class="activity-item" ${linkAttrs}>
                <div class="activity-info">
                    <div class="activity-icon" style="${escapeHtml(item.iconStyle || '')}">${escapeHtml(item.icon)}</div>
                    <div>
                        <h4 style="font-weight:700;">${escapeHtml(item.title)}</h4>
                        <p style="font-size: 0.9rem; color: var(--ink-500);">${escapeHtml(item.description)}</p>
                    </div>
                </div>
                <span style="font-size:0.85rem; color:var(--ink-400);">${escapeHtml(item.meta || '')}</span>
            </${tag}>
        `;
    }

    function renderActivities(items) {
        if (!activityGrid) return;
        if (!items.length) {
            activityGrid.innerHTML = '<div style="padding: 28px; text-align: center; color: var(--ink-400);">No recent activity yet.</div>';
            return;
        }
        activityGrid.innerHTML = items.slice(0, 5).map(renderActivityItem).join('');
    }

    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = await api.get('/user');
        if (user.role === 'admin') {
            window.location.href = 'admin-home.html';
            return;
        }

        if (welcomeText) {
            const firstName = (user.full_name || user.username || 'there').split(' ')[0];
            welcomeText.innerHTML = `Welcome back,<br><span>${escapeHtml(firstName)}</span>`;
        }

        const [
            opportunities,
            interested,
            applications,
            invitations,
            rewards,
            notifications,
        ] = await Promise.all([
            api.get('/opportunities'),
            api.get('/interested-opportunities').catch(() => []),
            api.get('/applications').catch(() => []),
            api.get('/invitations').catch(() => []),
            api.get('/rewards/me').catch(() => null),
            api.get('/notifications').catch(() => []),
        ]);

        const oppById = new Map(opportunities.map((opp) => [opp.id, opp]));
        const receivedPendingInvites = invitations.filter((invite) => (
            invite.receiver_id === user.id && invite.status === 'pending'
        ));
        
        // Accurate Personal Stats
        const enrolledProjects = applications.filter(a => a.status === 'enrolled');
        const workshops = opportunities.filter((opp) => String(opp.type || '').toLowerCase() === 'workshop');
        const eventsThisMonth = opportunities.filter((opp) => (
            String(opp.type || '').toLowerCase() === 'event' && isThisMonth(opp.schedule_time)
        ));

        setText(inviteCountEl, receivedPendingInvites.length);
        setText(activeProjectCountEl, enrolledProjects.length);
        setText(workshopCountEl, workshops.length);
        setText(eventCountEl, eventsThisMonth.length);

        const activities = [];

        receivedPendingInvites.slice(0, 2).forEach((invite) => {
            activities.push({
                icon: '+',
                iconStyle: 'background:#f0fdf4; color:#22c55e;',
                title: 'Collaboration Invite',
                description: `${invite.topic} is waiting for your response.`,
                meta: 'Pending',
                href: 'appointment.html',
            });
        });

        applications.slice(0, 2).forEach((record) => {
            const opp = oppById.get(record.opportunity_id);
            activities.push({
                icon: 'OK',
                iconStyle: 'background:#eff6ff; color:#3b82f6;',
                title: 'Application Status',
                description: `${opp?.title || 'Opportunity'} is marked ${record.status}.`,
                meta: record.status,
                href: opp ? detailPageForOpportunity(opp) : 'opportunities.html',
            });
        });

        interested.slice(0, 2).forEach((record) => {
            const opp = oppById.get(record.opportunity_id);
            activities.push({
                icon: '*',
                iconStyle: 'background:#fefce8; color:#eab308;',
                title: 'Saved Interest',
                description: `${opp?.title || 'Opportunity'} is in your interested list.`,
                meta: 'Interested',
                href: opp ? detailPageForOpportunity(opp) : 'interested.html',
            });
        });

        notifications
            .filter((item) => item.id !== 'empty')
            .slice(0, 2)
            .forEach((item) => {
                activities.push({
                    icon: '!',
                    iconStyle: 'background:var(--sky-100); color:var(--sky-600);',
                    title: item.title,
                    description: item.message,
                    meta: item.category,
                    href: item.action_url || '#',
                });
            });

        if (!activities.length && rewards) {
            activities.push({
                icon: 'XP',
                iconStyle: 'background:#fefce8; color:#eab308;',
                title: 'Reward Balance',
                description: `You currently have ${Number(rewards.total_points || 0).toLocaleString('en-IN')} reward points.`,
                meta: rewards.active_mode,
                href: '#professional-incentive-module',
            });
        }

        if (!activities.length && opportunities.length) {
            const latest = opportunities[0];
            activities.push({
                icon: 'New',
                title: 'Latest Opportunity',
                description: `${latest.title} is open for participation.`,
                meta: latest.type,
                href: detailPageForOpportunity(latest),
            });
        }

        renderActivities(activities);
    } catch (err) {
        console.error('Dashboard init failed:', err);
        if (String(err.message || '').includes('expired') || String(err.message || '').includes('401')) {
            window.location.href = 'login.html';
            return;
        }

        renderActivities([{
            icon: '!',
            title: 'Dashboard Error',
            description: err.message || 'Unable to load dashboard data.',
            meta: 'Error',
            href: '#',
        }]);
    }
});
