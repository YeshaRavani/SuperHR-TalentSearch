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

      function exitEditMode(save) {
        if (save) {
          // write values back
          viewName.textContent = inputName.value.trim() || '—';
          viewInstitution.textContent = inputInstitution.value.trim() || '—';
          viewTeam.textContent = inputTeam.value.trim() || '—';
          // User ID remains unchanged as it's readonly
          // skills
          var skills = Array.from(editSkillsList.querySelectorAll('.edit-skill-tag')).map(function (t) { return t.dataset.value; });
          viewSkills.innerHTML = '';
          skills.forEach(function (s) { var sp = document.createElement('span'); sp.className = 'skill-pill'; sp.textContent = s; viewSkills.appendChild(sp); });
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
      editSkillsBtn.addEventListener('click', function () { if (editSkillsArea.classList.contains('hidden')) { editSkillsArea.classList.remove('hidden'); viewSkills.classList.add('hidden'); } else { editSkillsArea.classList.add('hidden'); viewSkills.classList.remove('hidden'); } });
      saveBtn.addEventListener('click', function () { exitEditMode(true); });
      cancelBtn.addEventListener('click', function () { exitEditMode(false); });

    })();

document.addEventListener('DOMContentLoaded', function () {
      const role = localStorage.getItem('userRole');
      if (role === 'employee') {
        // Hide 'Posted Opportunities' in navbar or anywhere
        document.querySelectorAll('a[href="posted-opportunities.html"]').forEach(el => el.style.display = 'none');

        // Hide any explicitly named 'Post Opportunity' buttons/links connecting to add-opportunity.html
        document.querySelectorAll('a[href="add-opportunity.html"]').forEach(el => el.style.display = 'none');

        // Hide dynamically labeled matching interface elements
        document.querySelectorAll('button, .btn').forEach(btn => {
          if (btn.textContent.includes('Post Opportunity')) {
            btn.style.display = 'none';
          }
        });
      }
    });