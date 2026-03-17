document.addEventListener('DOMContentLoaded', () => {
          const container = document.getElementById('workshops-container');
          if (container && window.superHrOpportunities) {
            const items = window.superHrOpportunities.filter(o => o.category === 'Workshop');
            container.innerHTML = items.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('');
          }
        });

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

      // Reveal Animation
      const revealElements = document.querySelectorAll('.reveal');
      const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, revealOptions);
      revealElements.forEach(el => revealObserver.observe(el));
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
    });