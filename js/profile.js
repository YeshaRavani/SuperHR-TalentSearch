document.addEventListener('DOMContentLoaded', async function () {
  // Dynamically populate profile from the logged-in user
  try {
    const user = await api.get('/user');

    // Name
    const viewName = document.getElementById('viewName');
    if (viewName) viewName.textContent = user.full_name || 'Rushil Gargash';

    // Institution / organisation
    const viewInstitution = document.getElementById('viewInstitution');
    if (viewInstitution) viewInstitution.textContent = user.organisation || 'Plaksha University';

    // Team
    const viewTeam = document.getElementById('viewTeam');
    if (viewTeam) viewTeam.textContent = user.department_team || 'General';

    // Role (displayed in viewModeDetails static text area)
    const roleMeta = document.querySelector('#viewModeDetails .meta:nth-child(4)');
    if (roleMeta) roleMeta.textContent = 'Role: ' + (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Contributor');

    // Member Since
    const sinceMeta = document.querySelector('#viewModeDetails .meta:nth-child(5)');
    if (sinceMeta && user.created_at) {
      const date = new Date(user.created_at);
      sinceMeta.textContent = 'Member Since: ' + date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // User ID
    const viewId = document.getElementById('viewId');
    if (viewId) viewId.textContent = user.id || '—';

    // Points
    const pointsValue = document.getElementById('pointsValue');
    if (pointsValue) pointsValue.textContent = (user.total_points || 0).toLocaleString();

    // Avatar — show initials if no photo
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
      // Generate initials from full name
      const initials = (user.full_name || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      function renderInitialsAvatar() {
        const canvas = document.createElement('canvas');
        canvas.width = 120; canvas.height = 120;
        const ctx = canvas.getContext('2d');
        // Pick a colour based on initials for personality
        const colours = ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899'];
        const colourIdx = initials.charCodeAt(0) % colours.length;
        ctx.fillStyle = colours[colourIdx];
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 60, 60);
        profileAvatar.src = canvas.toDataURL();
        profileAvatar.onerror = null;
      }

      if (user.profile_photo_url) {
        // User has a real photo — use it, fall back to initials if it fails
        profileAvatar.src = user.profile_photo_url;
        profileAvatar.onerror = renderInitialsAvatar;
      } else {
        // No photo stored — immediately show coloured initials avatar
        renderInitialsAvatar();
      }
    }

    // Skills - Populate from API
    const viewSkills = document.getElementById('viewSkills');
    if (viewSkills && user.skills) {
      viewSkills.innerHTML = '';
      if (user.skills.length === 0) {
        viewSkills.innerHTML = '<span style="color:var(--ink-400); font-size:0.85rem;">No skills added yet.</span>';
      } else {
        user.skills.forEach(skill => {
          const sp = document.createElement('span');
          sp.className = 'skill-pill';
          sp.textContent = skill;
          viewSkills.appendChild(sp);
        });
      }
    }

    // Load Stats
    try {
      const stats = await api.get('/user/stats');
      const pointsValue = document.getElementById('pointsValue');
      if (pointsValue) pointsValue.textContent = (stats.points_earned || 0).toLocaleString();

      const oppsJoinedValue = document.getElementById('oppsJoinedValue');
      if (oppsJoinedValue) oppsJoinedValue.textContent = (stats.opportunities_joined || 0).toLocaleString();

      const interestsValue = document.getElementById('interestsValue');
      if (interestsValue) interestsValue.textContent = (stats.interests_shown || 0).toLocaleString();

      const messagesValue = document.getElementById('messagesValue');
      if (messagesValue) messagesValue.textContent = (stats.community_messages || 0).toLocaleString();

      const rewardPointsValue = document.getElementById('rewardPointsValue');
      if (rewardPointsValue) rewardPointsValue.textContent = (stats.reward_points || 0).toLocaleString();

      const rankValue = document.getElementById('rankValue');
      if (rankValue) rankValue.textContent = stats.leaderboard_rank ? `#${stats.leaderboard_rank}` : '—';
    } catch (e) {
      console.warn('Could not load user stats:', e.message);
    }

    // Load Contributions & Activity
    try {
      const [
        opportunities,
        interested,
        applications,
        invitations
      ] = await Promise.all([
        api.get('/opportunities'),
        api.get('/interested-opportunities').catch(() => []),
        api.get('/applications').catch(() => []),
        api.get('/invitations').catch(() => [])
      ]);

      const oppById = new Map(opportunities.map(o => [o.id, o]));

      // 1. Render Contributions (Only applications that are NOT 'interested')
      const contributionsGrid = document.getElementById('contributionsGrid');
      if (contributionsGrid) {
        const contributedApps = applications.filter(a => a.status !== 'interested' && a.opportunity_id);
        if (contributedApps.length === 0) {
          contributionsGrid.innerHTML = '<div style="padding: 28px; text-align: center; color: var(--ink-400); grid-column: 1 / -1; width: 100%; white-space: nowrap;">No contributions yet. Join an opportunity to get started!</div>';
        } else {
          contributionsGrid.innerHTML = contributedApps.map(app => {
            const opp = oppById.get(app.opportunity_id);
            if (!opp) return '';
            const typeClass = `badge-${(opp.type || 'initiative').toLowerCase()}`;
            return `
              <div class="opportunity-card">
                <div class="card-header">
                  <h4 class="opportunity-title">${opp.title}</h4>
                  <span class="category-badge ${typeClass}">${opp.type || 'Initiative'}</span>
                </div>
                <div class="opportunity-meta">
                  <div class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Status: ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </div>
                  <div class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${opp.schedule_time || 'Ongoing'}
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // 2. Render Recent Activity (Aligned with Dashboard)
      const activityGrid = document.getElementById('profileActivityGrid');
      if (activityGrid) {
        const activities = [];
        
        // Applications
        applications.slice(0, 3).forEach(app => {
          const opp = oppById.get(app.opportunity_id);
          activities.push({
            icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            bg: 'var(--sky-100)',
            title: `Joined <span style="color:var(--sky-500);">${opp?.title || 'Opportunity'}</span>`,
            meta: app.updated_at ? new Date(app.updated_at).toLocaleDateString() : 'Recently'
          });
        });

        // Invitations
        invitations.filter(i => i.receiver_id === user.id).slice(0, 2).forEach(inv => {
          activities.push({
            icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
            bg: 'var(--sky-100)',
            title: `Invited to <span style="color:var(--sky-500);">${inv.topic}</span>`,
            meta: new Date(inv.created_at).toLocaleDateString()
          });
        });

        if (activities.length === 0) {
          activityGrid.innerHTML = '<div style="padding: 28px; text-align: center; color: var(--ink-400);">No recent activity yet.</div>';
        } else {
          activityGrid.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px;">
              ${activities.map((act, idx) => `
                <div style="display:flex; gap:12px; align-items:flex-start; ${idx < activities.length - 1 ? 'padding-bottom:16px; border-bottom:1px solid rgba(16,30,43,0.05);' : ''}">
                  <div style="width:36px; height:36px; border-radius:50%; background:${act.bg}; color:var(--sky-600); display:grid; place-items:center;">
                    ${act.icon}
                  </div>
                  <div>
                    <div style="font-weight:600; color:var(--ink-900);">${act.title}</div>
                    <div style="font-size:0.8rem; color:var(--ink-400); margin-top:4px;">${act.meta}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

    } catch (e) {
      console.warn('Could not load user contributions/activity:', e.message);
    }
  } catch (e) {
    console.warn('Could not load profile data:', e.message);
  }
});


(function () {
      // notification dropdown behavior (same as index)
      document.querySelectorAll('.notification-wrap').forEach(function (wrap) {
        var toggle = wrap.querySelector('.notification-toggle');
        var panel = wrap.querySelector('.notification-panel');
        if (!toggle || !panel) return;
        toggle.addEventListener('click', function (e) { e.stopPropagation(); var isOpen = panel.classList.toggle('open'); toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); });
        panel.addEventListener('click', function (e) { e.stopPropagation(); });
        document.addEventListener('click', function () { panel.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { panel.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } });
      });

      // Profile edit UI
      var editBtn = document.getElementById('editBtn');
      var logoutBtn = document.getElementById('logoutBtn');
      var saveBtn = document.getElementById('saveBtn');
      var cancelBtn = document.getElementById('cancelBtn');
      var editSkillsBtn = document.getElementById('editSkillsBtn');

      var viewModeDetails = document.getElementById('viewModeDetails');
      var editModeDetails = document.getElementById('editModeDetails');
      var changePhotoBtn = document.getElementById('changePhotoBtn');

      var viewName = document.getElementById('viewName');
      var inputName = document.getElementById('inputName');
      var viewInstitution = document.getElementById('viewInstitution');
      var inputInstitution = document.getElementById('inputInstitution');
      var viewTeam = document.getElementById('viewTeam');
      var inputTeam = document.getElementById('inputTeam');
      var viewId = document.getElementById('viewId');
      var inputId = document.getElementById('inputId');

      var viewSkills = document.getElementById('viewSkills');
      var editSkillsArea = document.getElementById('editSkillsArea');
      var editSkillsList = document.getElementById('editSkillsList');
      var skillInput = document.getElementById('skillInput');

      var profileAvatar = document.getElementById('profileAvatar');
      var imageInput = document.getElementById('imageInput');

      var originalData = {};

      function enterEditMode() {
        // store original
        originalData.name = viewName.textContent.trim();
        originalData.institution = viewInstitution.textContent.trim();
        originalData.team = viewTeam.textContent.trim();
        originalData.id = viewId.textContent.trim();
        originalData.skills = Array.from(viewSkills.querySelectorAll('.skill-pill')).map(function (s) { return s.textContent.trim(); });
        originalData.avatar = profileAvatar.src;

        // show inputs
        viewModeDetails.classList.add('hidden');
        editModeDetails.classList.remove('hidden');
        changePhotoBtn.classList.remove('hidden');

        inputName.value = originalData.name;
        inputInstitution.value = originalData.institution;
        inputTeam.value = originalData.team;
        inputId.value = originalData.id;

        // skills
        viewSkills.classList.add('hidden'); editSkillsArea.classList.remove('hidden');
        renderEditSkills(originalData.skills);

        editBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');
      }

      async function exitEditMode(save) {
        if (save) {
          saveBtn.disabled = true;
          saveBtn.textContent = 'Saving...';
          
          try {
            const skills = Array.from(editSkillsList.querySelectorAll('.edit-skill-tag')).map(t => t.dataset.value);
            const payload = {
              full_name: inputName.value.trim(),
              organisation: inputInstitution.value.trim(),
              department_team: inputTeam.value.trim(),
              skills: skills
            };

            // If avatar was changed (it will be a base64 string)
            if (profileAvatar.src.startsWith('data:image')) {
              payload.profile_photo_url = profileAvatar.src;
            }

            await api.put('/user', payload);

            // update values back in view
            viewName.textContent = inputName.value.trim() || '—';
            viewInstitution.textContent = inputInstitution.value.trim() || '—';
            viewTeam.textContent = inputTeam.value.trim() || '—';
            
            viewSkills.innerHTML = '';
            skills.forEach(function (s) { 
              var sp = document.createElement('span'); 
              sp.className = 'skill-pill'; 
              sp.textContent = s; 
              viewSkills.appendChild(sp); 
            });
          } catch (err) {
            alert('Failed to save profile: ' + err.message);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
            return;
          } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
          }
        } else {
          // revert
          profileAvatar.src = originalData.avatar;
          viewSkills.innerHTML = '';
          originalData.skills.forEach(function (s) { var sp = document.createElement('span'); sp.className = 'skill-pill'; sp.textContent = s; viewSkills.appendChild(sp); });
        }

        viewModeDetails.classList.remove('hidden');
        editModeDetails.classList.add('hidden');
        changePhotoBtn.classList.add('hidden');
        viewSkills.classList.remove('hidden'); editSkillsArea.classList.add('hidden');

        editBtn.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
      }

      function renderEditSkills(list) {
        editSkillsList.innerHTML = '';
        list.forEach(function (s) {
          var tag = document.createElement('div'); tag.className = 'edit-skill-tag'; tag.dataset.value = s; tag.textContent = s;
          var rem = document.createElement('button'); rem.type = 'button'; rem.textContent = '✕'; rem.style.border = 'none'; rem.style.background = 'transparent'; rem.style.cursor = 'pointer'; rem.style.marginLeft = '8px';
          rem.addEventListener('click', function () { tag.remove(); });
          tag.appendChild(rem);
          editSkillsList.appendChild(tag);
        });
      }

      // add skill on Enter
      skillInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); var val = skillInput.value.trim(); if (!val) return; var tag = document.createElement('div'); tag.className = 'edit-skill-tag'; tag.dataset.value = val; tag.textContent = val; var rem = document.createElement('button'); rem.type = 'button'; rem.textContent = '✕'; rem.style.border = 'none'; rem.style.background = 'transparent'; rem.style.cursor = 'pointer'; rem.style.marginLeft = '8px'; rem.addEventListener('click', function () { tag.remove(); }); tag.appendChild(rem); editSkillsList.appendChild(tag); skillInput.value = ''; } });

      // avatar change
      profileAvatar.addEventListener('click', function () { if (saveBtn.classList.contains('hidden')) return; imageInput.click(); });
      changePhotoBtn.addEventListener('click', function () { imageInput.click(); });
      imageInput.addEventListener('change', function (e) { var file = e.target.files && e.target.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function (ev) { profileAvatar.src = ev.target.result; }; reader.readAsDataURL(file); });

      editBtn.addEventListener('click', enterEditMode);
      editSkillsBtn.addEventListener('click', function () {
        if (editSkillsArea.classList.contains('hidden')) {
          const currentSkills = Array.from(viewSkills.querySelectorAll('.skill-pill')).map(s => s.textContent.trim());
          renderEditSkills(currentSkills);
          editSkillsArea.classList.remove('hidden');
          viewSkills.classList.add('hidden');
          
          // Show save/cancel buttons
          editBtn.classList.add('hidden');
          logoutBtn.classList.add('hidden');
          saveBtn.classList.remove('hidden');
          cancelBtn.classList.remove('hidden');
        } else {
          // If we are already in edit mode (maybe from editBtn), this just toggles the area
          // But usually we want to keep the save buttons visible if we are editing
        }
      });
      const addSkillMockBtn = document.getElementById('addSkillMockBtn');
      if (addSkillMockBtn) {
        addSkillMockBtn.addEventListener('click', function () {
          if (editSkillsArea.classList.contains('hidden')) {
            const currentSkills = Array.from(viewSkills.querySelectorAll('.skill-pill')).map(s => s.textContent.trim());
            renderEditSkills(currentSkills);
            editSkillsArea.classList.remove('hidden');
            viewSkills.classList.add('hidden');
          }
          
          // Show save/cancel buttons
          editBtn.classList.add('hidden');
          saveBtn.classList.remove('hidden');
          cancelBtn.classList.remove('hidden');
          
          skillInput.focus();
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          localStorage.removeItem('access_token');
          localStorage.removeItem('userRole');
          window.location.href = 'index (1).html';
        });
      }

      editBtn.addEventListener('click', enterEditMode);
      saveBtn.addEventListener('click', function () { exitEditMode(true); });
      cancelBtn.addEventListener('click', function () { exitEditMode(false); });

    })();

