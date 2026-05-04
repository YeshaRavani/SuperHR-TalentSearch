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

        editBtn.classList.add('hidden'); saveBtn.classList.remove('hidden'); cancelBtn.classList.remove('hidden');
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

        editBtn.classList.remove('hidden'); saveBtn.classList.add('hidden'); cancelBtn.classList.add('hidden');
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

      saveBtn.addEventListener('click', function () { exitEditMode(true); });
      cancelBtn.addEventListener('click', function () { exitEditMode(false); });

    })();

