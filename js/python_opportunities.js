document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('opportunities-master-container');
    if (!container || !window.api || !window.OpportunityMapper) return;

    let allOpps = [];
    let interestedIds = new Set();

    function showToast(message) {
        let toast = document.getElementById('opp-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'opp-toast';
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '32px',
                left: '50%',
                transform: 'translateX(-50%) translateY(20px)',
                background: 'var(--ink-900)',
                color: '#fff',
                padding: '10px 22px',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: '600',
                zIndex: '9999',
                boxShadow: '0 8px 24px rgba(15,31,43,0.18)',
                opacity: '0',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
            });
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    }

    function getPythonOpps() {
        return allOpps.filter((opp) => {
            const skills = Array.isArray(opp.skills) ? opp.skills : [];
            return skills.some((skill) => skill.toLowerCase() === 'python');
        });
    }

    function renderAll() {
        const pythonOpps = getPythonOpps().map((opp) => ({
            ...opp,
            isInterested: interestedIds.has(String(opp.id)),
        }));

        if (!pythonOpps.length) {
            container.innerHTML = '<p style="color:var(--ink-400);font-size:0.95rem;padding:16px 0;">No Python opportunities found.</p>';
            return;
        }

        container.innerHTML = `
            <div class="category-section reveal active" id="filtered-grid">
                <h2 class="category-title">Python Opportunities</h2>
                <section class="initiatives-grid">
                    ${pythonOpps.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('')}
                </section>
            </div>
        `;

        if (window.initReveal) window.initReveal();
    }

    async function fetchData() {
        try {
            const [opps, interests] = await Promise.all([
                window.api.get('/opportunities'),
                localStorage.getItem('access_token')
                    ? window.api.get('/interested-opportunities')
                    : Promise.resolve([]),
            ]);

            allOpps = opps.map((opp) => window.OpportunityMapper.map(opp));
            interestedIds = new Set(interests.map((interest) => String(interest.opportunity_id)));
            renderAll();
        } catch (err) {
            console.error('Failed to fetch Python opportunities:', err);
            container.innerHTML = '<p style="color:red; text-align:center;">Failed to load data.</p>';
        }
    }

    container.addEventListener('click', async (event) => {
        const interestBtn = event.target.closest('.interest-btn');
        if (interestBtn) {
            event.preventDefault();
            event.stopPropagation();

            const id = String(interestBtn.dataset.id);
            if (!localStorage.getItem('access_token')) {
                window.location.href = 'login.html';
                return;
            }

            if (interestedIds.has(id)) return;

            try {
                interestBtn.disabled = true;
                interestBtn.textContent = 'Adding...';
                await window.api.post(`/interested-opportunities?opp_id=${id}`);
                interestedIds.add(id);
                showToast('Added to Interested Opportunities');
                renderAll();
            } catch (err) {
                console.error('Interest action failed:', err);
                interestBtn.disabled = false;
                interestBtn.textContent = 'Interested';
                showToast('Action failed. Are you logged in?');
            }
            return;
        }

        const card = event.target.closest('.initiative-card');
        if (card) {
            const link = card.querySelector('.card-link');
            if (link) window.location.href = link.href;
        }
    });

    fetchData();
});
