document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const oppId = params.get('id') || params.get('event');
    if (!oppId) {
        window.location.href = 'opportunities.html';
        return;
    }

    const detailContainer = document.querySelector('.page');
    if (!detailContainer) return;

    try {
        const rawData = await api.get(`/opportunities/${oppId}`);
        const data = window.OpportunityMapper.map(rawData);
        populateUI(data);
    } catch (err) {
        console.error("Failed to load opportunity details:", err);
        detailContainer.innerHTML = '<div style="padding:100px; text-align:center;"><h2>Opportunity not found</h2><a href="opportunities.html" class="btn btn-sky">Back to Opportunities</a></div>';
    }

    function populateUI(data) {
        // Populate Title & Header
        document.title = "Talent Search - " + data.title;
        const titleEl = document.getElementById('detail-title');
        const categoryEl = document.getElementById('detail-category');
        const descEl = document.getElementById('detail-desc');
        
        if (titleEl) titleEl.textContent = data.title;
        if (categoryEl) categoryEl.textContent = data.category;
        if (descEl) descEl.textContent = data.fullDescription;

        // Meta Info
        const scheduleEl = document.getElementById('detail-schedule');
        const pointsEl = document.getElementById('detail-points');
        const timeEl = document.getElementById('detail-time');
        const locationEl = document.getElementById('detail-location');

        if (scheduleEl) scheduleEl.textContent = data.dateStr || "-";
        if (pointsEl) pointsEl.textContent = data.points || "-";
        if (timeEl) timeEl.textContent = data.timeRequired || "-";
        if (locationEl) locationEl.textContent = data.location || "TBD";

        // Expectations
        const expNode = document.getElementById('detail-expectations');
        if (expNode) {
            if (Array.isArray(data.expectations) && data.expectations.length > 0) {
                expNode.innerHTML = `<ul style="padding-left: 20px; color: var(--ink-700);">${data.expectations.map(e => `<li style="margin-bottom:8px;">${e}</li>`).join('')}</ul>`;
            } else {
                expNode.textContent = data.expectations || "No specific expectations listed.";
            }
        }

        // Skills
        const skillsContainer = document.getElementById('detail-skills');
        if (skillsContainer) {
            if (data.skills && data.skills.length > 0) {
                skillsContainer.innerHTML = data.skills.map(s => `<span class="skill-chip">${s}</span>`).join('');
            } else {
                skillsContainer.innerHTML = `<span class="skill-chip">General</span>`;
            }
        }

        // Action Area Buttons
        const actionArea = document.querySelector('.action-area');
        if (actionArea) {
            let extraHtml = '';
            const createListCard = (title, list) => `
                <div class="info-card">
                  <h3 class="card-heading" style="margin-bottom:16px;">${title}</h3>
                  <ul style="padding-left: 20px; color: var(--ink-700);">
                    ${list.map(r => `<li style="margin-bottom:8px">${r}</li>`).join('')}
                  </ul>
                </div>
            `;

            if (data.responsibilities && data.responsibilities.length > 0) {
                extraHtml += createListCard('Responsibilities', data.responsibilities);
            }
            if (data.benefits && data.benefits.length > 0) {
                extraHtml += createListCard('What You’ll Gain', data.benefits);
            }
            if (data.prerequisites && data.prerequisites.length > 0) {
                extraHtml += createListCard('Prerequisites', data.prerequisites);
            }

            if (extraHtml) {
                actionArea.insertAdjacentHTML('beforebegin', extraHtml);
            }
        }

        // Applied Count
        if (data.appliedCount > 0) {
            const header = document.querySelector('.detail-header');
            if (header) {
                const summary = document.createElement('div');
                summary.className = 'participants-summary';
                summary.style.cssText = 'margin-top:16px; font-size: 0.95rem; color: var(--ink-500); display:flex; align-items:center; gap:8px;';
                summary.innerHTML = `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span><strong>${data.appliedCount} people</strong> have applied</span>
                `;
                header.appendChild(summary);
            }
        }

        // Buttons wiring
        const btnInt = document.getElementById('btn-interest');
        const successMsg = document.getElementById('success-msg');
        
        if (btnInt) {
            const role = localStorage.getItem('userRole');
            if (role === 'admin') {
                btnInt.style.display = 'none';
            } else {
                btnInt.addEventListener('click', async () => {
                   try {
                       await api.post(`/applications?opp_id=${data.id}`);
                       btnInt.style.display = 'none';
                       if (successMsg) {
                           successMsg.classList.add('active');
                           successMsg.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Application Registered!`;
                       }
                   } catch (err) {
                       alert("Failed to apply. Are you logged in?");
                   }
                });
            }
        }
    }

    // Shared Navbar & Notifications logic
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
        });
        window.addEventListener('click', () => {
            if (notifDropdown.classList.contains('active')) notifDropdown.classList.remove('active');
        });
        notifDropdown.addEventListener('click', e => e.stopPropagation());
    }
});
