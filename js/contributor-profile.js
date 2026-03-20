document.addEventListener('DOMContentLoaded', async () => {
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    const profileOrg = document.getElementById('profile-org');
    const profileRole = document.getElementById('profile-role');
    
    try {
        const user = await api.get('/user');
        if (profileName) profileName.textContent = user.full_name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileOrg) profileOrg.textContent = user.organisation || 'SuperHR';
        if (profileRole) profileRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

        // Load applications
        const apps = await api.get('/applications');
        renderApplications(apps);
    } catch (err) {
        console.error("Profile init failed:", err);
    }

    function renderApplications(apps) {
        const list = document.getElementById('applications-list');
        if (!list) return;
        list.innerHTML = '';
        
        if (apps.length === 0) {
            list.innerHTML = '<p class="empty-state">No applications found.</p>';
            return;
        }

        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'app-item';
            item.innerHTML = `
                <div class="app-info">
                    <div class="app-title">${app.opportunity_id}</div>
                    <div class="app-status status-${app.status}">${app.status}</div>
                </div>
                <div class="app-date">${new Date(app.created_at).toLocaleDateString()}</div>
            `;
            list.appendChild(item);
        });
    }
});