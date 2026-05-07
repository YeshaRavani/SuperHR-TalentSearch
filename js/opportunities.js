document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('opportunities-master-container');
    if (!list) return;

    // This page should remain visible even if shared reveal bootstrapping lags.
    document.querySelectorAll('.page .reveal').forEach((el) => el.classList.add('active'));

    // Load initial data
    let allOpportunities = [];
    let interestedList = [];
    let userSkills = [];
    let activeSkill = 'all';

    function isLoggedIn() {
        return Boolean(localStorage.getItem('access_token'));
    }

    function calculateMatchScore(oppSkills) {
        if (!userSkills.length || !oppSkills.length) return 0;
        const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
        const matches = oppSkills.filter(s => normalizedUserSkills.includes(s.toLowerCase()));
        return Math.round((matches.length / oppSkills.length) * 100);
    }

    function renderSkillFilters() {
        const filterContainer = document.getElementById('skillsFilter');
        if (!filterContainer) return;

        // Context-aware "All" count
        const currentContextOpps = getBasePageFilter(allOpportunities);
        const contextCount = currentContextOpps.length;
        const totalPlatform = allOpportunities.length;
        const isHub = window.location.pathname.includes('opportunities.html') || window.location.pathname.endsWith('/');

        // Navbar always shows total platform opportunities
        const oppLink = document.querySelector('.menu a[href="opportunities.html"]');
        if (oppLink) {
            oppLink.innerHTML = `Opportunities <span style="font-size: 0.8em; opacity: 0.7;">(${totalPlatform})</span>`;
        }

        // "All" button logic: If on hub, it's a filter div. If on specific page, it's a link to hub.
        const allBtn = isHub 
            ? `<div class="skill-card ${activeSkill === 'all' ? 'active' : ''}" data-skill="all">All <span class="skill-count">(${contextCount})</span></div>`
            : `<a href="opportunities.html" class="skill-card" style="text-decoration:none; color:inherit;">All <span class="skill-count">(${totalPlatform})</span></a>`;

        const initialHtml = `
            ${allBtn}
            <a href="interested.html" class="skill-card ${window.location.pathname.includes('interested.html') ? 'active' : ''}" data-skill="Interested" 
               style="text-decoration: none; color: inherit; border: 1.5px solid var(--sky-400); background: #f0f9ff;">Interested 
               <span class="skill-count" id="count-interested">(${interestedList.length})</span></a>
        `;

        // Get top matching skills from user's profile
        // Only show skills that have at least one opportunity match
        const skillCounts = {};
        allOpportunities.forEach(opp => {
            const oppSkills = Array.isArray(opp.skills) ? opp.skills : [];
            oppSkills.forEach(s => {
                const normalized = s.trim();
                if (userSkills.some(us => us.toLowerCase() === normalized.toLowerCase())) {
                    skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
                }
            });
        });

        const sortedSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]).slice(0, 8);
        
        filterContainer.innerHTML = initialHtml + sortedSkills.map(skill => `
            <div class="skill-card ${activeSkill === skill ? 'active' : ''}" data-skill="${skill}">
                ${skill} <span class="skill-count">(${skillCounts[skill]})</span>
            </div>
        `).join('');

        // Re-wire event listeners
        filterContainer.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('click', () => {
                const skill = card.dataset.skill;
                if (skill === 'Interested') return; 
                filterContainer.querySelectorAll('.skill-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                activeSkill = skill;
                renderOpportunities(getActiveFilteredOpportunities());
            });
        });
    }

    try {
        allOpportunities = await api.get('/opportunities');
        
        if (isLoggedIn()) {
            try {
                const user = await api.get('/user');
                userSkills = user.skills || [];
                const interests = await api.get('/interested-opportunities');
                interestedList = interests.map(i => i.opportunity_id);
            } catch (e) {
                console.warn("Could not fetch user data", e);
            }
        }

        renderSkillFilters();
        updateSkillCounts(allOpportunities);
        renderOpportunities(getActiveFilteredOpportunities());
    } catch (err) {
        console.error("Failed to load opportunities:", err);
        list.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--ink-400);">Unable to load opportunities. Please check your connection.</div>';
    }

    function getBasePageFilter(opportunities) {
        if (window.location.pathname.includes('python.html')) {
            return opportunities.filter(o => {
                const skills = Array.isArray(o.skills) ? o.skills : [];
                return skills.some(s => s.toLowerCase() === 'python');
            });
        }

        if (window.location.pathname.includes('interested.html')) {
            return opportunities.filter(o => interestedList.includes(o.id));
        }

        return opportunities;
    }

    function getActiveFilteredOpportunities() {
        let opportunities = getBasePageFilter(allOpportunities);
        if (activeSkill === 'all') {
            return opportunities;
        }
        if (activeSkill === 'Interested') {
            return opportunities;
        }

        return opportunities.filter(o => {
            const skills = Array.isArray(o.skills) ? o.skills : [];
            const search = activeSkill.toLowerCase();
            return skills.some(s => s.toLowerCase() === search) ||
                o.title.toLowerCase().includes(search);
        });
    }

    function renderOpportunities(opportunities) {
        list.innerHTML = '';

        if (opportunities.length === 0) {
            list.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--ink-400);">No matching opportunities found.</div>';
            return;
        }

        // Map backend opportunities to rich frontend format
        const richOpps = opportunities.map(o => {
            const base = window.OpportunityMapper.map(o);
            const matchScore = calculateMatchScore(o.skills || []);
            return {
                ...base,
                isInterested: interestedList.includes(o.id),
                matchScore: matchScore,
                hasMatch: matchScore > 0
            };
        });

        // Sort by match percentage (Descending - Best matches first)
        richOpps.sort((a, b) => b.matchScore - a.matchScore);
        
        const isInterestedPage = window.location.pathname.includes('interested.html');
        
        const section = document.createElement('div');
        section.className = 'category-section reveal active';
        section.style.marginTop = '10px';
        section.innerHTML = `
            <div class="initiatives-grid">
                ${richOpps.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4, isInterestedPage, isInterestedPage)).join('')}
            </div>
        `;
        list.appendChild(section);

        list.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
    }

    function updateSkillCounts(opportunities) {
        // Use the context-filtered list for counting (Hub vs Interested page)
        const activeContextList = getBasePageFilter(opportunities);
        
        // Query current dynamic elements
        const currentSkillCards = document.querySelectorAll('.skill-card');
        currentSkillCards.forEach(card => {
            const skill = card.dataset.skill;
            if (!skill) return;

            let count;
            if (skill === 'all') {
                count = activeContextList.length;
            } else if (skill === 'Interested') {
                count = interestedList.length;
            } else {
                count = activeContextList.filter(o => {
                    const skills = Array.isArray(o.skills) ? o.skills : [];
                    return skills.some(s => s.toLowerCase() === skill.toLowerCase()) || 
                           o.title.toLowerCase().includes(skill.toLowerCase());
                }).length;
            }

            const countSpan = card.querySelector('.skill-count');
            if (countSpan) countSpan.textContent = `(${count})`;
        });

        // Ensure the standalone count-interested span is updated
        const interestedSpan = document.getElementById('count-interested');
        if (interestedSpan) {
            interestedSpan.textContent = `(${interestedList.length})`;
        }
    }

    // Initial wiring handled by renderSkillFilters() dynamically.

    // ── Click Handling for Interest & Remove ──

    list.addEventListener('click', async function (e) {
        const intBtn = e.target.closest('.interest-btn');
        const removeBtn = e.target.closest('.remove-btn');

        if (intBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = String(intBtn.dataset.id);

            if (!isLoggedIn()) {
                alert('Please log in to save your interests.');
                window.location.href = 'login.html';
                return;
            }

            if (!interestedList.includes(id)) {
                try {
                    intBtn.disabled = true;
                    intBtn.textContent = 'Adding...';
                    await api.post(`/interested-opportunities?opp_id=${id}`);
                    interestedList.push(id);
                    updateSkillCounts(allOpportunities);
                    renderOpportunities(getActiveFilteredOpportunities());
                } catch(err) {
                    intBtn.disabled = false;
                    intBtn.textContent = 'Interested';
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

            if (!isLoggedIn()) {
                alert('Please log in to manage your interests.');
                window.location.href = 'login.html';
                return;
            }

            if (!interestedList.includes(id)) return;

            try {
                removeBtn.disabled = true;
                removeBtn.textContent = 'Removing...';
                await api.delete(`/interested-opportunities/${id}`);
                interestedList = interestedList.filter(i => i !== id);
                updateSkillCounts(allOpportunities);
                renderOpportunities(getActiveFilteredOpportunities());
            } catch(e) {
                removeBtn.disabled = false;
                removeBtn.textContent = 'Remove Interest';
                console.warn("Could not delete interest from backend:", e);
                alert('Could not remove interest. Please try again.');
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
