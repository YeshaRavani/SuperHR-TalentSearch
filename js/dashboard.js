// Dashboard Role-based Logic
document.addEventListener('DOMContentLoaded', function () {
    const roleBadge = document.getElementById('role-badge');
    const welcomeText = document.getElementById('welcome-text');
    const ctaContainer = document.getElementById('dashboard-ctas');

    const userType = localStorage.getItem('userType') || 'user';
    const userRole = localStorage.getItem('userRole') || 'contributor'; // fallback

    // Add greeting from signup data preservation if exists for absolute continuity
    const name = localStorage.getItem('signup_fullname');
    let greetingName = "Talent Discoverer";
    if (name) {
        greetingName = name.split(' ')[0]; // First name
    }

    // Safety redirect for Admin Type
    if (userType === 'admin') {
        window.location.href = 'admin-home.html';
        return;
    }

    if (welcomeText) welcomeText.innerHTML = `Welcome back,<br><span>${greetingName}</span>`;
});
