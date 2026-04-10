document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('initiatives-container');
    if (!container) return;

    try {
        const opportunities = await api.get('/opportunities');
        const initiatives = opportunities
            .filter(o => o.type === 'Initiative')
            .map(o => window.OpportunityMapper.map(o));
            
        if (initiatives.length === 0) {
            container.innerHTML = '<p style="color:var(--ink-400); text-align:center; padding: 40px;">No active initiatives at the moment.</p>';
        } else {
            container.innerHTML = initiatives.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('');
        }

        // Re-initialize reveal observer for new cards
        if (window.initReveal) {
            window.initReveal();
        }
    } catch (err) {
        console.error("Failed to load initiatives:", err);
        container.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Failed to load initiatives. Please try again later.</p>';
    }
});
