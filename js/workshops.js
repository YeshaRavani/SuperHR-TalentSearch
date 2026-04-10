document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('workshops-container');
    if (!container) return;

    try {
        const opportunities = await api.get('/opportunities');
        const workshops = opportunities
            .filter(o => o.type === 'Workshop')
            .map(o => window.OpportunityMapper.map(o));
            
        if (workshops.length === 0) {
            container.innerHTML = '<p style="color:var(--ink-400); text-align:center; padding: 40px;">No upcoming workshops at the moment.</p>';
        } else {
            container.innerHTML = workshops.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('');
        }

        // Re-initialize reveal observer for new cards
        if (window.initReveal) {
            window.initReveal();
        }
    } catch (err) {
        console.error("Failed to load workshops:", err);
        container.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Failed to load workshops. Please try again later.</p>';
    }
});
