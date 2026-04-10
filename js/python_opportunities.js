document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('opportunities-master-container');
    if (!container) return;

    let allOpps = [];
    let interestedIds = new Set();
    let selectedSkill = 'Python';

    // ── Toast ──────────────────────────────────────────────────────────
    function showToast(msg) {
        let t = document.getElementById('opp-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'opp-toast';
            Object.assign(t.style, {
                position: 'fixed', bottom: '32px', left: '50%',
                transform: 'translateX(-50%) translateY(20px)',
                background: 'var(--ink-900)', color: '#fff',
                padding: '10px 22px', borderRadius: '999px',
                fontSize: '0.9rem', fontWeight: '600', zIndex: '9999',
                boxShadow: '0 8px 24px rgba(15,31,43,0.18)',
                opacity: '0', transition: 'opacity 0.25s ease, transform 0.25s ease',
                pointerEvents: 'none', whiteSpace: 'nowrap'
            });
            document.body.appendChild(t);
        }
        t.textContent = msg;
        requestAnimationFrame(() => {
            t.style.opacity = '1';
            t.style.transform = 'translateX(-50%) translateY(0)';
        });
        clearTimeout(t._timer);
        t._timer = setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    }

    async function fetchData() {
        try {
            const [opps, interests] = await Promise.all([
                api.get('/opportunities'),
                api.get('/interested-opportunities')
            ]);
            allOpps = opps.map(o => window.OpportunityMapper.map(o));
            interestedIds = new Set(interests.map(i => String(i.opportunity_id)));
            renderAll();
        } catch (err) {
            console.error("Failed to fetch Python opportunities:", err);
            container.innerHTML = '<p style="color:red; text-align:center;">Failed to load data.</p>';
        }
    }

    function renderAll() {
        let html = '';

        // 1. My Interested section
        const interestedOpps = allOpps.filter(o => 
            interestedIds.has(String(o.id)) && 
            (selectedSkill === 'all' || (o.skills && o.skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase())))
        );

        if (interestedOpps.length > 0) {
            html += `
                <div class="category-section reveal active" id="my-interested">
                    <h2 class="category-title" style="color:var(--sky-600);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--sky-400)" style="margin-right:4px;flex-shrink:0;">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
                        </svg>
                        My Interested ${selectedSkill === 'all' ? '' : selectedSkill} Opportunities
                    </h2>
                    <section class="initiatives-grid">
                        ${interestedOpps.map((opp, i) => window.generateOpportunityCardHTML(opp, i % 4, true)).join('')}
                    </section>
                </div>`;
        }

        // 2. Main Pool
        const items = allOpps.filter(o =>
            (selectedSkill === 'all' || (o.skills && o.skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase()))) &&
            !interestedIds.has(String(o.id))
        );

        let sectionContent = '';
        if (items.length > 0) {
            sectionContent = items.map((opp, idx) =>
                window.generateOpportunityCardHTML(opp, idx % 4, false)
            ).join('');
        } else {
            sectionContent = `<p style="color:var(--ink-400);font-size:0.95rem;padding:16px 0;">No ${selectedSkill === 'all' ? '' : selectedSkill + ' '}opportunities found.</p>`;
        }

        html += `
            <div class="category-section reveal active" id="filtered-grid">
                <h2 class="category-title">${selectedSkill === 'all' ? 'All Opportunities' : `${selectedSkill} Opportunities`}</h2>
                <section class="initiatives-grid">${sectionContent}</section>
            </div>`;

        container.innerHTML = html;

        // Re-initialize reveal observer for new cards
        if (window.initReveal) {
            window.initReveal();
        }
    }

    container.addEventListener('click', async function (e) {
        const intBtn = e.target.closest('.btn-interested');
        const notBtn = e.target.closest('.btn-not-interested');

        if (intBtn || notBtn) {
            e.preventDefault();
            e.stopPropagation();

            const id = (intBtn || notBtn).dataset.id;

            try {
                if (intBtn) {
                    await api.post(`/interested-opportunities?opp_id=${id}`);
                    interestedIds.add(String(id));
                    showToast('❤️ Added to My Interested Opportunities');
                } else {
                    await api.delete(`/interested-opportunities/${id}`);
                    interestedIds.delete(String(id));
                    showToast('Removed from My Interested Opportunities');
                }
                renderAll();
            } catch (err) {
                console.error("Interest action failed:", err);
                showToast('Action failed. Are you logged in?');
            }
            return;
        }

        const card = e.target.closest('.initiative-card');
        if (card) {
            const link = card.querySelector('.card-link');
            if (link) window.location.href = link.href;
        }
    });

    fetchData();

    // Role check
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
        document.body.classList.add('is-admin');
    }
});