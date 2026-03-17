document.addEventListener('DOMContentLoaded', () => {
      const params = new URLSearchParams(window.location.search);
      // We use 'id' normally, but check 'event' for backwards compatibility
      const oppId = params.get('id') || params.get('event') || 'evt-1';

      let data = null;
      if (window.superHrOpportunities) {
        // If it's a direct ID match
        data = window.superHrOpportunities.find(o => o.id === oppId);
        // Backwards fallbacks if somehow looking up by legacy key
        if (!data) data = window.superHrOpportunities.find(o => o.id.includes(oppId) || oppId.includes(o.id));
        // Ultimate fallback
        if (!data) data = window.superHrOpportunities[0];
      } else {
        console.error("opportunities_data.js not loaded.");
        return;
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

      // Dynamic Back Button
      const backBtn = document.getElementById('back-btn');
      if (cat === "Workshop") {
        backBtn.href = "workshops.html";
        backBtn.innerHTML = "← Back to Workshops";
      } else if (cat === "Initiative") {
        backBtn.href = "initiatives.html";
        backBtn.innerHTML = "← Back to Initiatives";
      } else {
        backBtn.href = "events.html";
        backBtn.innerHTML = "← Back to Events";
      }

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