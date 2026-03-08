document.addEventListener('DOMContentLoaded', async () => {
    const welcomeText = document.getElementById('welcome-text');
    const roleBadge = document.getElementById('role-badge');
    
    // Fetch current user details
    try {
        const user = await api.get('/user');
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        if (welcomeText) {
            const firstName = user.full_name.split(' ')[0];
            welcomeText.innerHTML = `Welcome back,<br><span>${firstName}</span>`;
        }
        
        if (roleBadge) {
            roleBadge.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }

        // Fetch reward policy to display correct units
        const policy = await api.get('/admin/reward-policy');
        updateRewardUI(policy.active_mode);

    } catch (err) {
        console.error("Dashboard init failed:", err);
        // Fallback or redirect to login if unauthorized
        if (err.message.includes('401')) {
            window.location.href = 'login.html';
        }
    }

    function updateRewardUI(mode) {
        const rewardLabels = document.querySelectorAll('.reward-label');
        const labels = {
            'points': 'Total Points',
            'hours': 'Hours Logged',
            'money': 'Money Earned'
        };
        rewardLabels.forEach(el => {
            if (labels[mode]) el.textContent = labels[mode];
        });
    }
});
