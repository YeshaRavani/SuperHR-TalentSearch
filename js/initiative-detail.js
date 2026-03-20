document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const oppId = params.get('id') || params.get('event') || 'evt-1';

  try {
    const data = await api.get(`/opportunities/${oppId}`);
    populateUI(data);
  } catch (err) {
    console.error("Failed to load opportunity details:", err);
  }

  function populateUI(data) {
    // Populate Text
    document.title = "Talent Search - " + data.title;
    document.getElementById('detail-title').textContent = data.title;
    const cat = data.type || "Event";
    document.getElementById('detail-category').textContent = cat;
    document.getElementById('detail-desc').textContent = data.full_description;

    document.getElementById('detail-schedule').textContent = data.schedule_time || "-";
    document.getElementById('detail-points').textContent = data.points_reward || "-";
    document.getElementById('detail-time').textContent = data.time_required || "-";
    document.getElementById('detail-location').textContent = data.location || "TBD";
    
    // ... rest of the populate logic
  }

  // Populate Text
  document.title = "Talent Search - " + data.title;
  document.getElementById('detail-title').textContent = data.title;
  const cat = data.category || "Event";
  document.getElementById('detail-category').textContent = cat;
  document.getElementById('detail-desc').textContent = data.description;

  document.getElementById('detail-schedule').textContent = data.dateStr || "-";
  document.getElementById('detail-points').textContent = data.points || "-";
  document.getElementById('detail-time').textContent = data.timeRequired || "-";
  document.getElementById('detail-location').textContent = data.location || "TBD";

  // Expectations (Support Array)
  const expNode = document.getElementById('detail-expectations');
  if (Array.isArray(data.expectations)) {
    expNode.innerHTML = `<ul style="padding-left: 20px; color: var(--ink-700);">${data.expectations.map(e => `<li style="margin-bottom:8px;">${e}</li>`).join('')}</ul>`;
  } else {
    expNode.textContent = data.expectations || "No specific expectations listed.";
  }

  // Route all opportunity detail pages back to the unified opportunities listing.
  const backBtn = document.getElementById('back-btn');
  backBtn.href = "opportunities.html";
  backBtn.textContent = "← Back to Opportunities";

  // Populate Skills
  const skillsContainer = document.getElementById('detail-skills');
  if (data.skills && data.skills.length > 0) {
    skillsContainer.innerHTML = data.skills.map(s => `<span class="skill-chip">${s}</span>`).join('');
  } else {
    skillsContainer.innerHTML = `<span class="skill-chip">General</span>`;
  }

  // Add New Structured Sections Dynamically
  const actionArea = document.querySelector('.action-area');

  let extraHtml = '';
  const createListCard = (title, list) => `
        <div class="info-card">
          <h3 class="card-heading" style="margin-bottom:16px;">${title}</h3>
          <ul style="padding-left: 20px; color: var(--ink-700);">
            ${list.map(r => `<li style="margin-bottom:8px">${r}</li>`).join('')}
          </ul>
        </div>
      `;

  if (data.responsibilities) {
    extraHtml += createListCard('Responsibilities', data.responsibilities);
  }
  if (data.benefits) {
    extraHtml += createListCard('What You’ll Gain', data.benefits);
  }
  if (data.prerequisites) {
    extraHtml += createListCard('Prerequisites', data.prerequisites);
  }

  if (extraHtml) {
    actionArea.insertAdjacentHTML('beforebegin', extraHtml);
  }

  // Participants Sub-Tag
  if (data.appliedCount) {
    const header = document.querySelector('.detail-header');
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

  // Action Button
  const btnInt = document.getElementById('btn-interest');
  const successMsg = document.getElementById('success-msg');
  if (data.id === 'py-automation') {
    btnInt.textContent = "Apply for Opportunity";
  }
  btnInt.addEventListener('click', () => {
    btnInt.style.display = 'none';
    successMsg.classList.add('active');
    if (data.id === 'py-automation') {
      successMsg.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Application Registered!`;
    }
  });

  // Role Management (Global Navbar setup)
  const role = localStorage.getItem('userRole');

  // Notification Toggle logic
  const notifToggle = document.getElementById('notifToggle');
  const notifDropdown = document.getElementById('notifDropdown');
  if (notifToggle && notifDropdown) {
    notifToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('active');
    });
    window.addEventListener('click', () => {
      notifDropdown.classList.remove('active');
    });
    notifDropdown.addEventListener('click', e => e.stopPropagation());
  }
});
