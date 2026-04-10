document.addEventListener('DOMContentLoaded', async () => {
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    const badge = document.getElementById('notifBadge');
    const markBtn = document.getElementById('markAllReadBtn');

    const metricTotalUsers = document.getElementById('metricTotalUsers');
    const metricRemovedOpportunities = document.getElementById('metricRemovedOpportunities');
    const metricActiveOpportunities = document.getElementById('metricActiveOpportunities');
    const metricSystemHealth = document.getElementById('metricSystemHealth');
    const topSkillsList = document.getElementById('adminTopSkillsList');

    let skillRadarChart = null;
    let skillBarChart = null;
    let userGrowthChart = null;

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

        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach((element) => revealObserver.observe(element));
    }

    function animateCounter(element, target) {
        if (!element) return;
        const endValue = Number(target || 0);
        const start = 0;
        const steps = 24;
        let currentStep = 0;
        const increment = endValue / steps;

        element.textContent = '0';
        const timer = window.setInterval(() => {
            currentStep += 1;
            const nextValue = currentStep >= steps ? endValue : Math.round(start + (increment * currentStep));
            element.textContent = nextValue.toLocaleString('en-IN');
            if (currentStep >= steps) {
                window.clearInterval(timer);
            }
        }, 24);
    }

    function renderTopSkills(skills) {
        if (!topSkillsList) return;

        if (!skills.length) {
            topSkillsList.innerHTML = '<div style="padding: 18px 20px; color: var(--ink-500);">No skill data available yet.</div>';
            return;
        }

        const colors = [
            { dot: 'var(--sky-600)', text: '#0284c7', bg: '#e0f2fe' },
            { dot: '#7c3aed', text: '#7c3aed', bg: '#f3e8ff' },
            { dot: '#059669', text: '#059669', bg: '#d1fae5' },
            { dot: '#d97706', text: '#d97706', bg: '#fef3c7' },
            { dot: '#4f46e5', text: '#4f46e5', bg: '#e0e7ff' },
            { dot: '#dc2626', text: '#dc2626', bg: '#fee2e2' },
        ];

        topSkillsList.innerHTML = skills.map((skill, index) => {
            const color = colors[index % colors.length];
            const divider = index === skills.length - 1 ? 'none' : '1px solid rgba(15,31,43,0.04)';
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:${divider};">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:8px; height:8px; border-radius:50%; background:${color.dot};"></div>
                        <span style="font-weight:600; color:${color.text}; background:${color.bg}; padding:4px 12px; border-radius:16px; font-size:0.85rem;">${skill.label}</span>
                    </div>
                    <span style="font-size:0.9rem; font-weight:600; color:var(--ink-500);">${skill.value} users</span>
                </div>
            `;
        }).join('');
    }

    function renderDepartmentActivity(departments) {
        const container = document.getElementById('adminDepartmentActivity');
        if (!container) return;

        if (!departments.length) {
            container.innerHTML = '<div style="color: var(--ink-500);">No department activity data available.</div>';
            return;
        }

        const highest = Math.max(...departments.map((item) => item.value), 1);
        const colors = ['#1f6e90', '#357fa0', '#4a8fad', '#5b9fbd', '#7bb9d0'];
        container.innerHTML = departments.map((department, index) => {
            const percent = Math.round((department.value / highest) * 100);
            return `
                <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem; font-weight:600;">
                        <span style="display:flex; align-items:center; gap:8px;">
                            <div style="width:8px; height:8px; border-radius:50%; background:${colors[index % colors.length]};"></div>
                            ${department.label}
                        </span>
                        <span>${department.value}</span>
                    </div>
                    <div style="height:10px; background:#c2daea; border-radius:999px; overflow:hidden;">
                        <div style="height:100%; width:${percent}%; border-radius:999px; background:${colors[index % colors.length]};"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderCharts(stats) {
        const radarEl = document.getElementById('skillRadarChart');
        const barEl = document.getElementById('skillBarChart');
        const growthEl = document.getElementById('adminUserGrowthChart');

        const skillLabels = stats.top_skills.map((item) => item.label);
        const skillValues = stats.top_skills.map((item) => item.value);
        const growthLabels = stats.user_growth.map((item) => item.label);
        const growthValues = stats.user_growth.map((item) => item.value);

        if (radarEl && window.Chart) {
            skillRadarChart?.destroy();
            skillRadarChart = new Chart(radarEl.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: skillLabels,
                    datasets: [{
                        label: 'Users with skill',
                        data: skillValues,
                        backgroundColor: 'rgba(2, 132, 199, 0.15)',
                        borderColor: 'rgba(2, 132, 199, 0.8)',
                        pointBackgroundColor: 'rgba(2, 132, 199, 1)',
                        borderWidth: 2,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(15, 31, 43, 0.1)' },
                            grid: { color: 'rgba(15, 31, 43, 0.06)' },
                            pointLabels: { font: { size: 12, weight: '600' }, color: '#334155' },
                            ticks: { display: false },
                            suggestedMin: 0,
                        },
                    },
                },
            });
        }

        if (barEl && window.Chart) {
            skillBarChart?.destroy();
            skillBarChart = new Chart(barEl.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: skillLabels,
                    datasets: [{
                        label: 'Users count',
                        data: skillValues,
                        backgroundColor: 'rgba(2, 132, 199, 0.85)',
                        borderRadius: 8,
                        hoverBackgroundColor: 'rgba(2, 132, 199, 1)',
                    }],
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { beginAtZero: true, grid: { color: 'rgba(15, 31, 43, 0.03)' } },
                        y: { grid: { display: false }, ticks: { font: { size: 12, weight: '600' } } },
                    },
                },
            });
        }

        if (growthEl && window.Chart) {
            userGrowthChart?.destroy();
            userGrowthChart = new Chart(growthEl.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: growthLabels,
                    datasets: [{
                        label: 'New users',
                        data: growthValues,
                        backgroundColor: ['#5b9fbd', '#4a8fad', '#357fa0', '#1f6e90'],
                        borderRadius: 10,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false } },
                        y: { beginAtZero: true, ticks: { precision: 0 } },
                    },
                },
            });
        }
    }

    async function loadAdminDashboard() {
        const stats = await window.api.get('/admin/dashboard');
        animateCounter(metricTotalUsers, stats.total_users);
        animateCounter(metricRemovedOpportunities, stats.removed_opportunities);
        animateCounter(metricActiveOpportunities, stats.active_opportunities);
        if (metricSystemHealth) {
            metricSystemHealth.textContent = `${stats.system_health}%`;
        }
        renderTopSkills(stats.top_skills);
        renderDepartmentActivity(stats.department_activity);
        renderCharts(stats);
    }

    initChrome();

    try {
        await loadAdminDashboard();
    } catch (err) {
        console.error('Failed to load admin dashboard:', err);
        if (metricSystemHealth) {
            metricSystemHealth.textContent = 'Error';
        }
        if (topSkillsList) {
            topSkillsList.innerHTML = `<div style="padding: 18px 20px; color: #ef4444;">${err.message || 'Failed to load admin insights.'}</div>`;
        }
    }
});
