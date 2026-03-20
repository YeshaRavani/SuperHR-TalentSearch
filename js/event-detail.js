document.addEventListener('DOMContentLoaded', async () => {
      const params = new URLSearchParams(window.location.search);
      // We use 'id' normally, but check 'event' for backwards compatibility
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
        document.getElementById('detail-expectations').textContent = data.expectations || "No specific expectations listed.";
        
        // Action Button logic
        const btnInt = document.getElementById('btn-interest');
        const successMsg = document.getElementById('success-msg');
        btnInt.addEventListener('click', async () => {
            try {
                await api.post(`/interested-opportunities?opp_id=${data.id}`);
                btnInt.style.display = 'none';
                successMsg.classList.add('active');
            } catch (err) {
                alert("Action failed: " + err.message);
            }
        });
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
      document.getElementById('detail-expectations').textContent = data.expectations || "No specific expectations listed.";

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

      // Action Button
      const btnInt = document.getElementById('btn-interest');
      const successMsg = document.getElementById('success-msg');
      btnInt.addEventListener('click', () => {
        btnInt.style.display = 'none';
        successMsg.classList.add('active');
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
