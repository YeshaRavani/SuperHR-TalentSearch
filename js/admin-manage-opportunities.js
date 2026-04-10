document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('opportunities-master-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    const badge = document.getElementById('notifBadge');
    const markBtn = document.getElementById('markAllReadBtn');

    if (!container) return;

    let allOpportunities = [];
    let activeFilter = 'all';

    function setError(message) {
        container.innerHTML = `<div style="padding: 60px; text-align: center; color: #ef4444;">${message}</div>`;
    }

    function initChrome() {
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 20) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');

                if (scrollProgress) {
                    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
                    scrollProgress.style.width = `${scrolled}%`;
                }
            });
        }

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

    function getFilteredOpportunities() {
        if (activeFilter === 'all') {
            return allOpportunities.filter((opp) => opp.status !== 'removed');
        }

        return allOpportunities.filter((opp) => (
            opp.status !== 'removed' &&
            opp.category.toLowerCase() === activeFilter
        ));
    }

    function renderAll() {
        const visibleOpportunities = getFilteredOpportunities();
        if (!visibleOpportunities.length) {
            container.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">No opportunities match this filter.</div>';
            return;
        }

        const grouped = {
            event: visibleOpportunities.filter((opp) => opp.category === 'Event'),
            initiative: visibleOpportunities.filter((opp) => opp.category === 'Initiative'),
            workshop: visibleOpportunities.filter((opp) => opp.category === 'Workshop'),
        };

        const sections = [
            { key: 'event', title: 'Events', viewKey: 'events' },
            { key: 'initiative', title: 'Initiatives', viewKey: 'initiatives' },
            { key: 'workshop', title: 'Workshops', viewKey: 'workshops' },
        ];

        container.innerHTML = sections
            .filter((section) => grouped[section.key].length > 0)
            .map((section) => `
                <div class="category-section reveal active" id="${section.viewKey}">
                    <h2 class="category-title">${section.title}</h2>
                    <section class="initiatives-grid">
                        ${grouped[section.key].map((opp, index) => renderAdminCardHTML(opp, index % 4)).join('')}
                    </section>
                </div>
            `)
            .join('');

        if (window.initReveal) {
            window.initReveal();
        }
    }

    function renderAdminCardHTML(opp, indexDelay = 0) {
        const delayStyle = indexDelay > 0 ? `style="transition-delay: ${indexDelay * 0.1}s;"` : '';
        const animDelayClass = indexDelay > 0 ? `delay-${indexDelay}` : '';

        return `
            <article class="initiative-card reveal active ${animDelayClass}" ${delayStyle}>
                <div class="card-link" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; height:100%;">
                    <div class="card-image" aria-hidden="true" style="background: ${opp.bgGradient};">
                        <div class="card-icon-overlay" style="color: ${opp.iconColor};">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                ${opp.mainIcon}
                            </svg>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3>${opp.title}</h3>
                        <p>${opp.description}</p>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="tag">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    ${opp.tagIcon}
                                </svg>
                                ${opp.dateStr}
                            </span>
                            <span class="tag" style="background:var(--white); border-color:var(--sky-200); color:var(--ink-700);">
                                ${opp.category}
                            </span>
                            <span class="tag" style="background:var(--sky-50); border-color:var(--sky-200); color:var(--ink-800); font-weight:600;">
                                ${opp.status === 'removed' ? 'Removed' : 'Active'}
                            </span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; color:var(--ink-500); font-size:0.88rem;">
                            <span>${opp.location}</span>
                            <span>${opp.points} pts</span>
                        </div>
                        <div style="border-top:1px solid rgba(15,31,43,0.05); padding-top:16px; margin-top:16px;">
                            <button class="btn btn-remove" data-id="${opp.id}" style="width: 100%; height: 40px; border-radius: 999px; font-weight: 600; cursor: pointer; border: 1px solid #fca5a5; background: #fee2e2; color: #ef4444; transition: 0.3s; position: relative;">Remove Opportunity</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    async function fetchData() {
        try {
            const rawData = await window.api.get('/admin/opportunities');
            allOpportunities = rawData.map((opp) => window.OpportunityMapper.map(opp));
            renderAll();
        } catch (err) {
            console.error('Failed to fetch opportunities for admin:', err);
            setError(err.message || 'Failed to load opportunities.');
        }
    }

    container.addEventListener('click', async (e) => {
        const removeBtn = e.target.closest('.btn-remove');
        if (!removeBtn) return;

        const id = removeBtn.dataset.id;
        if (!id) return;

        if (!window.confirm('Are you sure you want to remove this opportunity from the platform?')) {
            return;
        }

        try {
            await window.api.delete(`/opportunities/${id}`);
            allOpportunities = allOpportunities.map((opp) => (
                opp.id === id ? { ...opp, status: 'removed' } : opp
            ));
            renderAll();
        } catch (err) {
            console.error('Failed to delete opportunity:', err);
            window.alert(err.message || 'Failed to delete opportunity.');
        }
    });

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            filterBtns.forEach((item) => item.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter || 'all';
            renderAll();
        });
    });

    initChrome();
    await fetchData();

    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
        document.body.classList.add('is-admin');
    }
});
