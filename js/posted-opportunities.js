document.addEventListener('DOMContentLoaded', async () => {
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const container = document.getElementById('posted-opportunities-container');

    let postedOpportunities = [];
    let applicantData = new Map();

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

    if (!container) return;

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function initials(name) {
        const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
        if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return String(name || '?').charAt(0).toUpperCase();
    }

    function statusLabel(status) {
        return String(status || 'active').replaceAll('_', ' ');
    }


    function renderPerson(record, opportunity) {
        const user = record.user;
        if (!user) return '';

        const score = record.match_score || 0;
        const reasoning = record.match_reasoning || "No matching logic available.";
        const skills = (user.skills || []).map(escapeHtml).join('|');
        const bullets = [
            `${user.full_name || user.username} is currently marked as ${statusLabel(record.status)} for this opportunity.`,
            user.department_team ? `Team: ${user.department_team}.` : 'No department or team is set on this profile.',
            user.total_points ? `${user.total_points} reward points earned on the platform.` : 'No reward points recorded yet.',
        ].map(escapeHtml).join('|');

        const canEnroll = !['enrolled', 'completed', 'rejected'].includes(record.status);
        const canReject = !['rejected', 'completed'].includes(record.status);

        return `
            <div class="person-row" data-record-id="${escapeHtml(record.id)}">
                <div class="person" data-name="${escapeHtml(user.full_name || user.username)}"
                    data-avatar="${escapeHtml(initials(user.full_name || user.username))}"
                    data-role="${escapeHtml(`${statusLabel(user.role)}${user.department_team ? ` • ${user.department_team}` : ''}`)}"
                    data-skills="${skills}"
                    data-bullets="${bullets}">
                    <div class="avatar">${escapeHtml(initials(user.full_name || user.username))}</div>
                    <div>
                        <div class="person-name">${escapeHtml(user.full_name || user.username)}</div>
                        <div class="person-meta">${escapeHtml(user.email)} • ${escapeHtml(statusLabel(record.status))}</div>
                    </div>
                </div>
                <div class="match">
                    <div class="match-score">${score}% match</div>
                    <div class="match-bar"><span style="width:${score}%"></span></div>
                    <div class="match-reasoning">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-top:2px;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span>${escapeHtml(reasoning)}</span>
                    </div>
                    <div class="actions">
                        ${canEnroll ? `<button class="btn btn-sky applicant-status-btn" data-record-id="${escapeHtml(record.id)}" data-status="enrolled">Enroll</button>` : ''}
                        ${canReject ? `<button class="btn btn-secondary applicant-status-btn" data-record-id="${escapeHtml(record.id)}" data-status="rejected">Reject</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    function renderPanel(title, records, opportunity, emptyText) {
        return `
            <div class="panel">
                <h4>${escapeHtml(title)} (${records.length})</h4>
                ${records.length
                    ? records.map((record) => renderPerson(record, opportunity)).join('')
                    : `<p style="color:var(--ink-400); font-size:0.9rem; padding:10px;">${escapeHtml(emptyText)}</p>`
                }
            </div>
        `;
    }

    function renderPostedOpportunity(opp) {
        const overview = applicantData.get(opp.id) || { counts: {}, applicants: [] };
        const applicants = overview.applicants || [];
        const interested = applicants.filter((record) => record.status === 'interested');
        const activeApplicants = applicants.filter((record) => ['applied', 'enrolled', 'completed'].includes(record.status));

        return `
            <div class="opportunity-card" data-opp-id="${escapeHtml(opp.id)}">
                <div class="opportunity-head">
                    <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap;">
                        <div>
                            <h2 class="opportunity-title">${escapeHtml(opp.title)}</h2>
                            <div class="opportunity-expires">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${escapeHtml(statusLabel(opp.status || 'active'))}
                            </div>
                        </div>
                        <button class="btn btn-secondary delete-opportunity-btn" data-id="${escapeHtml(opp.id)}" style="border-color:#fca5a5; color:#ef4444;">Remove</button>
                    </div>
                    <div class="opportunity-meta">
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${escapeHtml(opp.schedule_time || 'Upcoming')}
                        </span>
                        <span style="background: #fefce8; color: #eab308; border: 1px solid #fef08a;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            ${Number(opp.points_reward || 0).toLocaleString('en-IN')} XP Points
                        </span>
                        <span>${escapeHtml(opp.location || 'No location set')}</span>
                    </div>
                </div>

                <div class="grid">
                    ${renderPanel('Interested', interested, opp, 'No interests yet.')}
                    ${renderPanel('Applicants / Enrolled', activeApplicants, opp, 'No applications or enrollments yet.')}
                </div>
            </div>
        `;
    }

    function renderAll() {
        if (!postedOpportunities.length) {
            container.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">You haven\'t posted any opportunities yet.</div>';
            return;
        }

        container.innerHTML = postedOpportunities.map((opp) => renderPostedOpportunity(opp)).join('');
    }

    async function loadData() {
        try {
            container.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">Loading your posted opportunities...</div>';
            postedOpportunities = await api.get('/my-posted-opportunities');

            const overviews = await Promise.all(
                postedOpportunities.map(async (opp) => {
                    const overview = await api.get(`/opportunities/${opp.id}/applicants/overview`);
                    return [opp.id, overview];
                })
            );
            applicantData = new Map(overviews);
            renderAll();
        } catch (err) {
            console.error("Failed to load posted opportunities:", err);
            container.innerHTML = '<div style="padding: 60px; text-align: center; color: red;">Failed to load your posted opportunities. Please log in and try again.</div>';
        }
    }

    container.addEventListener('click', async (event) => {
        const person = event.target.closest('.person');
        if (person) {
            window.openResumeModal(
                person.dataset.name,
                person.dataset.avatar,
                person.dataset.role,
                (person.dataset.skills || '').split('|').filter(Boolean),
                (person.dataset.bullets || '').split('|').filter(Boolean),
            );
            return;
        }

        const statusBtn = event.target.closest('.applicant-status-btn');
        if (statusBtn) {
            const recordId = statusBtn.dataset.recordId;
            const status = statusBtn.dataset.status;
            try {
                statusBtn.disabled = true;
                statusBtn.textContent = 'Saving...';
                await api.put(`/applications/${recordId}?status=${encodeURIComponent(status)}`, {});
                await loadData();
            } catch (err) {
                console.error('Failed to update applicant status:', err);
                statusBtn.disabled = false;
                statusBtn.textContent = status === 'enrolled' ? 'Enroll' : 'Reject';
                window.alert(err.message || 'Failed to update applicant status.');
            }
            return;
        }

        const deleteBtn = event.target.closest('.delete-opportunity-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (!window.confirm('Remove this posted opportunity from the platform?')) return;

            try {
                deleteBtn.disabled = true;
                deleteBtn.textContent = 'Removing...';
                await api.delete(`/opportunities/${id}`);
                postedOpportunities = postedOpportunities.filter((opp) => opp.id !== id);
                applicantData.delete(id);
                renderAll();
            } catch (err) {
                console.error('Failed to remove posted opportunity:', err);
                deleteBtn.disabled = false;
                deleteBtn.textContent = 'Remove';
                window.alert(err.message || 'Failed to remove opportunity.');
            }
        }
    });

    await loadData();

    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
        document.body.classList.add('is-admin');
    }
});
