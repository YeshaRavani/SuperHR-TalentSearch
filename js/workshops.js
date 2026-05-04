document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('workshops-container');
    if (!container) return;

    let interestedIds = new Set();

    async function loadInterestedIds() {
        if (!localStorage.getItem('access_token')) return;
        const interests = await api.get('/interested-opportunities');
        interestedIds = new Set(interests.map((interest) => String(interest.opportunity_id)));
    }

    function renderWorkshops(opportunities) {
        const workshops = opportunities
            .filter(o => o.type === 'Workshop')
            .map(o => ({
                ...window.OpportunityMapper.map(o),
                isInterested: interestedIds.has(String(o.id)),
            }));

        if (workshops.length === 0) {
            container.innerHTML = '<p style="color:var(--ink-400); text-align:center; padding: 40px;">No upcoming workshops at the moment.</p>';
        } else {
            container.innerHTML = workshops.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('');
        }

        if (window.initReveal) {
            window.initReveal();
        }
    }

    try {
        const opportunities = await api.get('/opportunities');
        await loadInterestedIds();
        renderWorkshops(opportunities);
    } catch (err) {
        console.error("Failed to load workshops:", err);
        container.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Failed to load workshops. Please try again later.</p>';
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
                await api.post(`/interested-opportunities?opp_id=${id}`);
                interestedIds.add(id);
                interestBtn.textContent = 'Saved';
                interestBtn.style.background = 'var(--green-500, #10b981)';
                interestBtn.style.color = 'white';
            } catch (err) {
                console.error('Failed to save interest:', err);
                interestBtn.disabled = false;
                interestBtn.textContent = 'Interested';
                window.alert('Could not save interest. Please try again.');
            }
            return;
        }

        const card = event.target.closest('.initiative-card');
        if (card) {
            const link = card.querySelector('.card-link');
            if (link) window.location.href = link.href;
        }
    });
});
