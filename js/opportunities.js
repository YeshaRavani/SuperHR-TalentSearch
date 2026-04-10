document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('opportunities-master-container');
    const skillCards = document.querySelectorAll('.skill-card');
    if (!list) return;

    // This page should remain visible even if shared reveal bootstrapping lags.
    document.querySelectorAll('.page .reveal').forEach((el) => el.classList.add('active'));

    // Load initial data
    let allOpportunities = [];
    let interestedList = [];
    let removedList = JSON.parse(localStorage.getItem('removedOpportunities') || '[]');

    try {
        allOpportunities = await api.get('/opportunities');
        
        // Fetch user's interests first
        try {
            if (localStorage.getItem('access_token')) {
                const interests = await api.get('/interested-opportunities');
                interestedList = interests.map(i => i.opportunity_id);
            }
        } catch (e) {
            console.warn("Could not fetch user interests", e);
        }

        updateSkillCounts(allOpportunities);
        
        // Define initial filter based on the current page
        let initialFilter = allOpportunities;
        if (window.location.pathname.includes('python.html')) {
            initialFilter = allOpportunities.filter(o => {
                const skills = Array.isArray(o.skills) ? o.skills : [];
                return skills.some(s => s.toLowerCase() === 'python');
            });
        } else if (window.location.pathname.includes('interested.html')) {
            initialFilter = allOpportunities.filter(o => interestedList.includes(o.id));
        }

        renderOpportunities(initialFilter);
    } catch (err) {
        console.error("Failed to load opportunities:", err);
        list.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--ink-400);">Unable to load opportunities. Please check your connection.</div>';
    }

    function renderOpportunities(opportunities) {
        list.innerHTML = '';
        
        const visibleOpps = opportunities.filter(o => !removedList.includes(o.id));
        
        if (visibleOpps.length === 0) {
            list.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">No matching opportunities found.</div>';
            return;
        }

        // Map backend opportunities to rich frontend format
        const richOpps = visibleOpps.map(o => window.OpportunityMapper.map(o));
        
        // Render all opportunities without category divisions
        const section = document.createElement('div');
        section.className = 'category-section reveal active';
        section.style.marginTop = '10px';
        section.innerHTML = `
            <div class="initiatives-grid">
                ${richOpps.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('')}
            </div>
        `;
        list.appendChild(section);

        list.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
    }

    function updateSkillCounts(opportunities) {
        const visibleOpps = opportunities.filter(o => !removedList.includes(o.id));

        skillCards.forEach(card => {
            const skill = card.dataset.skill;
            if (skill === 'all') return;

            let count;
            if (skill === 'Interested') {
                count = visibleOpps.filter(o => interestedList.includes(o.id)).length;
            } else {
                count = visibleOpps.filter(o => {
                    const skills = Array.isArray(o.skills) ? o.skills : [];
                    return skills.some(s => s.toLowerCase() === skill.toLowerCase()) || 
                           o.title.toLowerCase().includes(skill.toLowerCase());
                }).length;
            }

            const countSpan = card.querySelector('.skill-count');
            if (countSpan) countSpan.textContent = `(${count})`;
        });
    }

    // Wiring filter buttons
    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            const skill = card.dataset.skill;
            if (skill === 'Interested' || skill === 'Python' || skill === 'all') return; // Handled by href natively on some pages

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

    // ── Click Handling for Interest & Remove ──

    list.addEventListener('click', async function (e) {
        const intBtn = e.target.closest('.interest-btn');
        const removeBtn = e.target.closest('.remove-btn');

        if (intBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = String(intBtn.dataset.id);

            if (!interestedList.includes(id)) {
                try {
                    await api.post(`/interested-opportunities?opp_id=${id}`);
                    interestedList.push(id);
                    intBtn.innerHTML = "Added!";
                    intBtn.style.background = "var(--green-500)";
                    intBtn.style.color = "white";
                    
                    updateSkillCounts(allOpportunities);
                    
                    // Shift the user to the interested tab as requested
                    window.location.href = 'interested.html';
                } catch(err) {
                    if (err.message && err.message.includes('expired')) {
                        alert('Please log in to save your interests!');
                        window.location.href = 'login.html';
                    } else {
                        alert('Could not add to interested. Please try again.');
                    }
                }
            }
            return;
        }

        if (removeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = String(removeBtn.dataset.id);

            if (!removedList.includes(id)) {
                removedList.push(id);
                localStorage.setItem('removedOpportunities', JSON.stringify(removedList));
            }

            // Sync with backend so the interest is officially revoked 
            if (interestedList.includes(id)) {
                try {
                    await api.delete(`/interested-opportunities/${id}`);
                } catch(e) {
                    console.warn("Could not delete from backend:", e);
                }
                interestedList = interestedList.filter(i => i !== id);
            }
            
            // Update the pill count instantly
            updateSkillCounts(allOpportunities);

            // Trigger a re-render by clicking the active skill card again
            if (window.location.pathname.includes('interested.html')) {
                 renderOpportunities(allOpportunities.filter(o => interestedList.includes(o.id)));
            } else {
                const activeCard = document.querySelector('.skill-card.active');
                if (activeCard && !activeCard.dataset.skill.includes('Interested')) {
                    activeCard.click();
                } else if (window.location.pathname.includes('python.html')) {
                    renderOpportunities(allOpportunities.filter(o => {
                        const skills = Array.isArray(o.skills) ? o.skills : [];
                        return skills.some(s => s.toLowerCase() === 'python');
                    }));
                } else {
                    renderOpportunities(allOpportunities);
                }
            }
            return;
        }

        const card = e.target.closest('.initiative-card');
        if (card) {
            const link = card.querySelector('.card-link');
            if (link) {
                window.location.href = link.href;
            }
        }
    });
});
