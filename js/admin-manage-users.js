document.addEventListener('DOMContentLoaded', async () => {
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    const badge = document.getElementById('notifBadge');
    const markBtn = document.getElementById('markAllReadBtn');

    const policyCards = document.querySelectorAll('.policy-card');
    const contextContainer = document.getElementById('incentiveContext');
    const savePolicyBtn = document.getElementById('savePolicyBtn');
    const policySummary = document.getElementById('policySummary');
    const usersTableBody = document.getElementById('usersTableBody');
    const addUserBtn = document.getElementById('addUserBtn');

    let users = [];
    let state = { mode: 'points', hoursPerLeave: 8 };
    let pendingMode = state.mode;

    function initChrome() {
        window.addEventListener('scroll', () => {
            if (navbar) {
                if (window.scrollY > 20) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            }

            if (scrollProgress) {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
                scrollProgress.style.width = `${scrolled}%`;
            }
        });

        if (notifToggle && notifDropdown) {
            notifToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                notifDropdown.classList.toggle('active');
            });
            window.addEventListener('click', () => notifDropdown.classList.remove('active'));
            notifDropdown.addEventListener('click', (e) => e.stopPropagation());
        }

        if (markBtn && badge) {
            markBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                badge.style.display = 'none';
                document.querySelectorAll('.notif-item').forEach((item) => {
                    item.style.opacity = '0.6';
                });
            });
        }
    }

    function getRewardMarkup(user) {
        const points = Number(user.total_points || 0);
        if (state.mode === 'points') {
            return `<strong>${points.toLocaleString('en-IN')}</strong> points`;
        }

        if (state.mode === 'hours') {
            const leaveUnits = state.hoursPerLeave ? (points / state.hoursPerLeave) : 0;
            const displayUnits = Number(leaveUnits.toFixed(2)).toLocaleString('en-IN');
            return `
                <div style="line-height:1.4;">
                    <strong>${displayUnits}</strong> leave units
                    <div style="font-size:0.85rem; color:var(--ink-500);">${points} pts using ${state.hoursPerLeave} hrs policy</div>
                </div>
            `;
        }

        const moneyEquivalent = points * 10;
        return `
            <div style="line-height:1.4;">
                <strong>₹${moneyEquivalent.toLocaleString('en-IN')}</strong> equivalent
                <div style="font-size:0.85rem; color:var(--ink-500);">Derived from ${points} reward points</div>
            </div>
        `;
    }

    function renderUsers() {
        if (!usersTableBody) return;

        if (!users.length) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 24px; color: var(--ink-500); text-align: center;">No users available.</td>
                </tr>
            `;
            return;
        }

        usersTableBody.innerHTML = users.map((user) => `
            <tr style="border-bottom: 1px solid var(--sky-50);">
                <td style="padding: 16px;">
                    <a href="user-profile.html?id=${encodeURIComponent(user.id)}"
                        style="display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; cursor:pointer;">
                        <div style="min-width:40px; height:40px; border-radius:50%; background: var(--sky-200); display:grid; place-items:center; font-weight:700; color: var(--sky-600);">
                            ${(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:600; color: var(--ink-900);">${user.full_name}</div>
                            <div style="font-size:0.85rem; color: var(--ink-500);">${user.email}</div>
                        </div>
                    </a>
                </td>
                <td style="padding:16px; font-weight:500;">
                    <div>${user.department_team || 'Unassigned'}</div>
                    <div style="font-size:0.8rem; color:var(--ink-500); text-transform:capitalize;">${user.role.replaceAll('_', ' ')}</div>
                </td>
                <td style="padding:16px;">${getRewardMarkup(user)}</td>
                <td style="padding:16px; text-align:right;">
                    <button class="btn delete-user-btn" data-id="${user.id}" style="height: 32px; padding: 0 12px; font-size: 0.8rem; background: #fee2e2; color: #ef4444;">Remove</button>
                </td>
            </tr>
        `).join('');
    }

    function renderContext() {
        if (!contextContainer) return;
        if (state.mode === 'hours') {
            contextContainer.style.display = 'flex';
            contextContainer.innerHTML = `
                <div class="conversion-inline">
                    <span>Active conversion rule:</span>
                    <input type="number" id="hoursInput" class="conversion-input" value="${state.hoursPerLeave}" min="1">
                    <span>points = 1 leave unit</span>
                </div>
            `;
            const hoursInput = document.getElementById('hoursInput');
            if (hoursInput) {
                hoursInput.addEventListener('change', async (event) => {
                    const value = Number(event.target.value);
                    if (value > 0) {
                        state.hoursPerLeave = value;
                        await updatePolicy();
                        renderUsers();
                        updateSummary();
                    }
                });
            }
        } else {
            contextContainer.style.display = 'none';
            contextContainer.innerHTML = '';
        }
    }

    function updateSummary() {
        if (!policySummary) return;
        const labels = { points: 'Points', hours: 'Hours Worked', money: 'Money' };
        let html = `Current policy: <strong>${labels[state.mode] || 'Points'}</strong>`;
        if (state.mode === 'hours') {
            html += `<br><span style="font-weight:400; font-size:0.85rem; color:var(--ink-500);">${state.hoursPerLeave} points = 1 leave unit</span>`;
        }
        if (state.mode === 'money') {
            html += `<br><span style="font-weight:400; font-size:0.85rem; color:var(--ink-500);">Displayed as a point-derived currency equivalent.</span>`;
        }
        policySummary.innerHTML = html;
    }

    function setPendingCard(mode) {
        pendingMode = mode;
        policyCards.forEach((card) => {
            card.classList.toggle('selected', card.getAttribute('data-mode') === pendingMode);
        });
        if (savePolicyBtn) {
            savePolicyBtn.disabled = pendingMode === state.mode;
            savePolicyBtn.textContent = pendingMode === state.mode ? 'Policy Saved' : 'Save Policy Change';
        }
    }

    async function loadPolicy() {
        try {
            const policy = await window.api.get('/admin/reward-policy');
            state.mode = policy.active_mode;
            state.hoursPerLeave = policy.hours_per_leave;
            pendingMode = state.mode;
        } catch (err) {
            console.error('Failed to load reward policy:', err);
        }

        renderContext();
        updateSummary();
        setPendingCard(state.mode);
    }

    async function updatePolicy() {
        await window.api.put('/admin/reward-policy', {
            active_mode: state.mode,
            hours_per_leave: state.hoursPerLeave,
        });
    }

    async function loadUsers() {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="padding: 24px; color: var(--ink-500); text-align: center;">Loading users...</td>
            </tr>
        `;

        users = await window.api.get('/admin/users');
        renderUsers();
    }

    async function deleteUser(id) {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        await window.api.delete(`/admin/users/${id}`);
        users = users.filter((user) => user.id !== id);
        renderUsers();
    }

    async function createUser() {
        const fullName = window.prompt('Full name');
        if (!fullName) return;
        const username = window.prompt('Username');
        if (!username) return;
        const email = window.prompt('Email');
        if (!email) return;
        const role = window.prompt('Role (admin, contributors, head_of_department)', 'contributors');
        if (!role) return;
        const organisation = window.prompt('Organisation', 'SuperHR') || 'SuperHR';
        const departmentTeam = window.prompt('Department / Team', 'Operations') || 'Operations';
        const password = window.prompt('Temporary password', 'user123') || 'user123';

        await window.api.post('/admin/users', {
            username,
            email,
            full_name: fullName,
            role,
            organisation,
            department_team: departmentTeam,
            password,
        });

        await loadUsers();
    }

    usersTableBody?.addEventListener('click', async (event) => {
        const deleteBtn = event.target.closest('.delete-user-btn');
        if (!deleteBtn) return;
        try {
            await deleteUser(deleteBtn.dataset.id);
        } catch (err) {
            console.error('Failed to delete user:', err);
            window.alert(err.message || 'Failed to delete user.');
        }
    });

    addUserBtn?.addEventListener('click', async () => {
        try {
            await createUser();
        } catch (err) {
            console.error('Failed to create user:', err);
            window.alert(err.message || 'Failed to create user.');
        }
    });

    policyCards.forEach((card) => {
        card.addEventListener('click', () => setPendingCard(card.getAttribute('data-mode')));
    });

    savePolicyBtn?.addEventListener('click', async () => {
        if (pendingMode === state.mode) return;
        try {
            state.mode = pendingMode;
            await updatePolicy();
            renderContext();
            updateSummary();
            renderUsers();
            setPendingCard(state.mode);
        } catch (err) {
            console.error('Failed to update policy:', err);
            window.alert(err.message || 'Failed to update policy.');
        }
    });

    initChrome();

    await loadPolicy();

    try {
        await loadUsers();
    } catch (err) {
        console.error('Failed to initialise admin users page:', err);
        if (usersTableBody) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 24px; color: #ef4444; text-align: center;">${err.message || 'Failed to load admin data.'}</td>
                </tr>
            `;
        }
    }
});
