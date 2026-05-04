document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const oppId = params.get('id') || params.get('event');
    const detailContainer = document.querySelector('.page');

    if (!oppId) {
        window.location.href = 'opportunities.html';
        return;
    }
    if (!detailContainer) return;

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function setText(id, value, fallback = '-') {
        const element = document.getElementById(id);
        if (element) element.textContent = value || fallback;
    }

    function getActionLabel(category) {
        const type = String(category || '').toLowerCase();
        return type === 'initiative' ? 'Apply' : 'Register';
    }

    function showStatus(message, isError = false) {
        const successMsg = document.getElementById('success-msg');
        if (!successMsg) return;
        successMsg.classList.add('active');
        successMsg.style.color = isError ? '#ef4444' : '';
        successMsg.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            ${escapeHtml(message)}
        `;
    }

    function renderList(targetId, values, fallback) {
        const node = document.getElementById(targetId);
        if (!node) return;
        if (Array.isArray(values) && values.length) {
            node.innerHTML = `<ul style="padding-left: 20px; color: var(--ink-700);">${values.map((item) => `<li style="margin-bottom:8px;">${escapeHtml(item)}</li>`).join('')}</ul>`;
        } else {
            node.textContent = fallback;
        }
    }

    function renderSkills(skills) {
        const container = document.getElementById('detail-skills');
        if (!container) return;
        const list = Array.isArray(skills) && skills.length ? skills : ['General'];
        container.innerHTML = list.map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('');
    }

    function renderExtraSections(data) {
        const actionArea = document.querySelector('.action-area');
        if (!actionArea || actionArea.dataset.extrasRendered === 'true') return;

        const sections = [
            ['Responsibilities', data.responsibilities],
            ["What You'll Gain", data.benefits],
            ['Prerequisites', data.prerequisites],
        ].filter(([, items]) => Array.isArray(items) && items.length);

        if (!sections.length) return;

        actionArea.dataset.extrasRendered = 'true';
        actionArea.insertAdjacentHTML('beforebegin', sections.map(([title, items]) => `
            <div class="info-card">
                <h3 class="card-heading" style="margin-bottom:16px;">${escapeHtml(title)}</h3>
                <ul style="padding-left: 20px; color: var(--ink-700);">
                    ${items.map((item) => `<li style="margin-bottom:8px">${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
        `).join(''));
    }

    async function configureActionButton(data, rawData) {
        const button = document.getElementById('btn-interest');
        if (!button) return;

        const actionLabel = getActionLabel(data.category);
        button.textContent = actionLabel;

        if (!localStorage.getItem('access_token')) {
            button.addEventListener('click', () => {
                window.location.href = 'login.html';
            }, { once: true });
            return;
        }

        let currentUser;
        try {
            currentUser = await api.get('/user');
        } catch (err) {
            button.addEventListener('click', () => {
                window.location.href = 'login.html';
            }, { once: true });
            return;
        }

        if (currentUser.role === 'admin') {
            button.style.display = 'none';
            return;
        }

        if (currentUser.id === rawData.author_id) {
            button.disabled = true;
            button.textContent = 'Your Opportunity';
            showStatus('You cannot apply to your own posted opportunity.');
            return;
        }

        const applications = await api.get('/applications').catch(() => []);
        const existing = applications.find((record) => record.opportunity_id === data.id);
        if (existing) {
            button.disabled = true;
            button.textContent = existing.status === 'applied' ? 'Applied' : existing.status;
            showStatus(`Already ${existing.status}.`);
            return;
        }

        const interests = await api.get('/interested-opportunities').catch(() => []);
        const existingInterest = interests.find((record) => record.opportunity_id === data.id);
        if (existingInterest) {
            button.disabled = true;
            button.textContent = 'Interested';
            showStatus('Already saved as interested.');
            return;
        }

        button.addEventListener('click', async () => {
            try {
                button.disabled = true;
                button.textContent = actionLabel === 'Apply' ? 'Applying...' : 'Registering...';
                const record = await api.post(`/applications?opp_id=${encodeURIComponent(data.id)}`);
                button.textContent = record.status === 'applied' ? 'Applied' : record.status;
                showStatus(data.category === 'Initiative' ? 'Application registered.' : 'Registration successful.');
            } catch (err) {
                button.disabled = false;
                button.textContent = actionLabel;
                showStatus(err.message || `Failed to ${actionLabel.toLowerCase()}.`, true);
            }
        });
    }

    function populateUI(data) {
        document.title = `Talent Search - ${data.title}`;
        setText('detail-title', data.title);
        setText('detail-category', data.category);
        setText('detail-desc', data.fullDescription);
        setText('detail-schedule', data.dateStr);
        setText('detail-points', data.points);
        setText('detail-time', data.timeRequired);
        setText('detail-location', data.location, 'TBD');
        renderList('detail-expectations', data.expectations, 'No specific expectations listed.');
        renderSkills(data.skills);
        renderExtraSections(data);
    }

    try {
        const rawData = await api.get(`/opportunities/${encodeURIComponent(oppId)}`);
        const data = window.OpportunityMapper.map(rawData);
        populateUI(data);
        await configureActionButton(data, rawData);
    } catch (err) {
        console.error('Failed to load opportunity details:', err);
        detailContainer.innerHTML = '<div style="padding:100px; text-align:center;"><h2>Opportunity not found</h2><a href="opportunities.html" class="btn btn-sky">Back to Opportunities</a></div>';
    }
});
