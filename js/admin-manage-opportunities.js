document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('opportunities-master-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!container) return;

    let allOpportunities = [];

    async function fetchData() {
        try {
            const rawData = await api.get('/opportunities');
            allOpportunities = rawData.map(o => window.OpportunityMapper.map(o));
            renderAll();
        } catch (err) {
            console.error("Failed to fetch opportunities for admin:", err);
            container.innerHTML = '<div style="padding: 60px; text-align: center; color: red;">Failed to load opportunities. Please ensure you are logged in as admin.</div>';
        }
    }

    function renderAll() {
        let html = '';

        const categories = [
            { key: 'Event', title: 'Events', viewKey: 'events' },
            { key: 'Initiative', title: 'Initiatives', viewKey: 'initiatives' },
            { key: 'Workshop', title: 'Workshops', viewKey: 'workshops' }
        ];

        categories.forEach(cat => {
            const items = allOpportunities.filter(o => o.category === cat.key);
            if (items.length > 0) {
                html += `
                  <div class="category-section reveal active" id="${cat.viewKey}">
                    <h2 class="category-title">${cat.title}</h2>
                    <section class="initiatives-grid">
                      ${items.map((opp, index) => renderAdminCardHTML(opp, index % 4)).join('')}
                    </section>
                  </div>
                `;
            }
        });

        if (html === '') {
            html = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">No opportunities found in the database.</div>';
        }

        container.innerHTML = html;

        // Re-initialize reveal observer for new cards
        if (window.initReveal) {
            window.initReveal();
        }
    }

    function renderAdminCardHTML(opp, indexDelay = 0) {
        const delayStyle = indexDelay > 0 ? `style="transition-delay: ${indexDelay * 0.1}s;"` : '';
        const animDelayClass = indexDelay > 0 ? `delay-${indexDelay}` : '';

        return `
            <article class="initiative-card reveal ${animDelayClass}" ${delayStyle}>
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
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <span class="tag">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    ${opp.tagIcon}
                                </svg>
                                ${opp.dateStr}
                            </span>
                            <span class="tag" style="background:var(--white); border-color:var(--sky-200); color:var(--ink-700);">
                                ${opp.category}
                            </span>
                            <span class="tag" style="background:var(--sky-50); border-color:var(--sky-200); color:var(--ink-800); font-weight: 600;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                ${opp.appliedCount || 0} Applied
                            </span>
                        </div>
                        <div style="border-top: 1px solid rgba(15,31,43,0.05); padding-top: 16px; margin-top: 16px;">
                            <button class="btn btn-remove" data-id="${opp.id}" style="width: 100%; height: 40px; border-radius: 999px; font-weight: 600; cursor: pointer; border: 1px solid #fca5a5; background: #fee2e2; color: #ef4444; transition: 0.3s; z-index: 10; position: relative;">Remove Opportunity</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    // Wiring remove buttons
    container.addEventListener('click', async (e) => {
        const removeBtn = e.target.closest('.btn-remove');
        if (removeBtn) {
            const id = removeBtn.dataset.id;
            if (confirm('Are you sure you want to remove this opportunity from the database?')) {
                try {
                    await api.delete(`/opportunities/${id}`);
                    allOpportunities = allOpportunities.filter(o => o.id !== id);
                    renderAll();
                } catch (err) {
                    console.error("Failed to delete opportunity:", err);
                    alert("Failed to delete opportunity.");
                }
            }
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Scroll logic or filtering can be added here if needed
        });
    });

    fetchData();

    // Shared UI logic
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');

            if (scrollProgress) {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
                scrollProgress.style.width = scrolled + "%";
            }
        });
    }

    // Role check
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
        document.body.classList.add('is-admin');
    }
});