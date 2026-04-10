document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('opportunities-master-container');
    const skillCards = document.querySelectorAll('.skill-card');
    if (!list) return;

    // This page should remain visible even if shared reveal bootstrapping lags.
    document.querySelectorAll('.page .reveal').forEach((el) => el.classList.add('active'));

    // Load initial data
    let allOpportunities = [];
    try {
        allOpportunities = await api.get('/opportunities');
        updateSkillCounts(allOpportunities);
        renderOpportunities(allOpportunities);
    } catch (err) {
        console.error("Failed to load opportunities:", err);
        list.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--ink-400);">Unable to load opportunities. Please check your connection.</div>';
    }

    function renderOpportunities(opportunities) {
        list.innerHTML = '';
        
        if (opportunities.length === 0) {
            list.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">No matching opportunities found.</div>';
            return;
        }

        // Map backend opportunities to rich frontend format
        const richOpps = opportunities.map(o => window.OpportunityMapper.map(o));
        
        // Group by category accurately
        const categories = [...new Set(richOpps.map(o => o.category))];
        
        categories.forEach(cat => {
            const catOpps = richOpps.filter(o => o.category === cat);
            const section = document.createElement('div');
            section.className = 'category-section reveal active'; // Keep active to ensure header is seen
            section.innerHTML = `
                <h2 class="category-title reveal active" style="margin-top: 40px; margin-bottom: 24px;">${cat}s</h2>
                <div class="initiatives-grid">
                    ${catOpps.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('')}
                </div>
            `;
            list.appendChild(section);
        });

        list.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
    }

    function updateSkillCounts(opportunities) {
        skillCards.forEach(card => {
            const skill = card.dataset.skill;
            if (skill === 'all' || skill === 'Interested') return;

            const count = opportunities.filter(o => {
                const skills = Array.isArray(o.skills) ? o.skills : [];
                return skills.some(s => s.toLowerCase() === skill.toLowerCase()) || 
                       o.title.toLowerCase().includes(skill.toLowerCase());
            }).length;

            const countSpan = card.querySelector('.skill-count');
            if (countSpan) countSpan.textContent = `(${count})`;
        });
    }

    // Wiring filter buttons
    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            const skill = card.dataset.skill;
            if (skill === 'Interested') return; // Link handled by href

            // UI feedback
            skillCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            if (skill === 'all') {
                renderOpportunities(allOpportunities);
            } else {
                const filtered = allOpportunities.filter(o => {
                    const skills = Array.isArray(o.skills) ? o.skills : [];
                    return skills.some(s => s.toLowerCase() === skill.toLowerCase()) || 
                           o.title.toLowerCase().includes(skill.toLowerCase());
                });
                renderOpportunities(filtered);
            }
        });
    });
});
