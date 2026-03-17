// Setup the new JS features after main.js mounts elements
    setTimeout(() => {
      // Navbar Scroll
      const navbar = document.querySelector('.topbar');
      if (navbar) navbar.id = "navbar";
      const scrollProgress = document.getElementById('scrollProgress');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20 && navbar) navbar.classList.add('scrolled');
        else if (navbar) navbar.classList.remove('scrolled');

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
        scrollProgress.style.width = scrolled + "%";
      });

      // Modify main.js injected styles slightly if needed:
      document.querySelectorAll('.icon-btn').forEach(btn => btn.id = "notifToggle");
      document.querySelectorAll('.notification-panel').forEach(p => p.id = "notifDropdown");

      // Add SVG icons to newly generated cards from main.js
      const colors = [
        { bg: 'linear-gradient(140deg, #eff6ff, #bfdbfe)', color: '#3b82f6' },
        { bg: 'linear-gradient(140deg, #fefce8, #fef08a)', color: '#eab308' },
        { bg: 'linear-gradient(140deg, #f0fdf4, #bbf7d0)', color: '#22c55e' },
        { bg: 'linear-gradient(140deg, #fdf4ff, #fbcfe8)', color: '#ec4899' },
        { bg: 'linear-gradient(140deg, #faf5ff, #e9d5ff)', color: '#a855f7' }
      ];

      document.querySelectorAll('.initiative-card').forEach((card, index) => {
        const img = card.querySelector('.card-image');
        if (img) {
          const style = colors[index % colors.length];
          img.style.background = style.bg;

          const iconBox = document.createElement('div');
          iconBox.className = 'card-icon-overlay';
          iconBox.style.color = style.color;
          iconBox.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
          img.appendChild(iconBox);
        }
      });

      // Fix menu logo icon
      const menuDot = document.querySelector('.icon-dot');
      const toggle = document.querySelector('.notification-toggle');
      if (toggle && !toggle.innerHTML.includes('svg')) {
        toggle.innerHTML = '';
        if (menuDot) toggle.appendChild(menuDot);
        toggle.innerHTML += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
      }

    }, 300); // 300ms wait for main.js to execute

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