document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('opportunities-master-container');
    if (!list) return;

    // Load initial data
    let allOpportunities = [];
    try {
        allOpportunities = await api.get('/opportunities');
        renderOpportunities(allOpportunities);
    } catch (err) {
        console.error("Failed to load opportunities:", err);
    }

    function renderOpportunities(opportunities) {
        list.innerHTML = '';
        
        // Group by type or just list them all as in the original design
        // The original design had sections like "General", "Python", etc. based on skills.
        // For the refined version, we'll follow the professional 2-column list or category sections.
        
        const categories = [...new Set(opportunities.map(o => o.type))];
        
        categories.forEach(cat => {
            const catOpps = opportunities.filter(o => o.type === cat);
            const section = document.createElement('div');
            section.className = 'category-section active';
            section.innerHTML = `
                <h2 class="category-title">${cat}s</h2>
                <div class="initiatives-grid">
                    ${catOpps.map(opp => generateCardHTML(opp)).join('')}
                </div>
            `;
            list.appendChild(section);
        });
    }

    function generateCardHTML(opp) {
        return `
            <div class="initiative-card" onclick="window.location.href='${opp.type.toLowerCase()}-detail.html?id=${opp.id}'">
                <div class="card-image" style="background-image: url('${opp.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'}')">
                    <div class="card-tag">${opp.type}</div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${opp.title}</h3>
                    <p class="card-desc">${opp.short_description}</p>
                    <div class="card-meta">
                        <span>${opp.schedule_time}</span>
                        <span>${opp.location}</span>
                        <span class="card-reward">+${opp.points_reward} pts</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Wiring filter buttons (if any)
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', () => {
            const skill = card.dataset.skill;
            if (skill === 'all') {
                renderOpportunities(allOpportunities);
            } else {
                const filtered = allOpportunities.filter(o => o.expectations.includes(skill) || o.title.includes(skill));
                renderOpportunities(filtered);
            }
        });
    });
});