document.addEventListener('DOMContentLoaded', () => {
      // Navbar Scroll
      const navbar = document.getElementById('navbar');
      const scrollProgress = document.getElementById('scrollProgress');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
        scrollProgress.style.width = scrolled + "%";
      });

      // Notifications
      const notifToggle = document.getElementById('notifToggle');
      const notifDropdown = document.getElementById('notifDropdown');
      notifToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
      });
      window.addEventListener('click', () => {
        if (notifDropdown.classList.contains('active')) notifDropdown.classList.remove('active');
      });
      notifDropdown.addEventListener('click', e => e.stopPropagation());
    });

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
      // --- Candidate Action Buttons Logic ---
      document.querySelectorAll('.action-invite').forEach(btn => {
        btn.addEventListener('click', function (e) {
          const personRow = e.target.closest('.person-row');
          if (!personRow) return;

          const panel = personRow.closest('.panel');
          const grid = personRow.closest('.grid');
          if (!panel || !grid) return;

          // Get enrolled panel (the second panel in the grid)
          const panels = grid.querySelectorAll('.panel');
          const enrolledPanel = panels[1];
          if (!enrolledPanel) return;

          // Remove action buttons since they are enrolled
          const actionsDiv = personRow.querySelector('.actions');
          if (actionsDiv) actionsDiv.remove();

          // Update styling to match Enrolled format
          const avatar = personRow.querySelector('.avatar');
          if (avatar) {
            avatar.style.background = 'linear-gradient(135deg, #f0fdf4, #bbf7d0)';
            avatar.style.color = '#16a34a';
          }

          const matchScore = personRow.querySelector('.match-score');
          if (matchScore) matchScore.style.color = '#16a34a';

          const matchBarSpan = personRow.querySelector('.match-bar span');
          if (matchBarSpan) {
            matchBarSpan.style.background = 'linear-gradient(90deg, #4ade80, #16a34a)';
          }

          // Move the DOM element to the enrolled panel
          enrolledPanel.appendChild(personRow);

          // Update Header Counters
          updateCounters(grid);
        });
      });

      document.querySelectorAll('.action-reject').forEach(btn => {
        btn.addEventListener('click', function (e) {
          const personRow = e.target.closest('.person-row');
          if (!personRow) return;

          const grid = personRow.closest('.grid');

          // Remove from DOM entirely
          personRow.remove();

          // Update Header Counters
          if (grid) updateCounters(grid);
        });
      });

      function updateCounters(grid) {
        const panels = grid.querySelectorAll('.panel');
        if (panels.length >= 2) {
          const interestedPanel = panels[0];
          const enrolledPanel = panels[1];

          const headerInterested = interestedPanel.querySelector('h4');
          const headerEnrolled = enrolledPanel.querySelector('h4');

          if (headerInterested) {
            const count = interestedPanel.querySelectorAll('.person-row').length;
            headerInterested.innerHTML = headerInterested.innerHTML.replace(/Interested \(\d+\)/, `Interested (${count})`);
          }
          if (headerEnrolled) {
            const count = enrolledPanel.querySelectorAll('.person-row').length;
            headerEnrolled.innerHTML = headerEnrolled.innerHTML.replace(/Enrolled \(\d+\)/, `Enrolled (${count})`);
          }
        }
      }
    });