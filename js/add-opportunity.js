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

      // Skills Tag Input
      let skills = ["Design Thinking"];
      const skillsWrap = document.getElementById('skillsWrap');
      const skillInput = document.getElementById('skillInput');

      function renderSkills() {
        // remove existing pills
        Array.from(skillsWrap.children).forEach(c => { if (c !== skillInput) skillsWrap.removeChild(c); });

        // insert pills before the input
        skills.forEach((s, idx) => {
          const pill = document.createElement('span');
          pill.className = 'skill-pill';
          pill.innerHTML = `${s} <button type="button">✕</button>`;
          pill.querySelector('button').addEventListener('click', () => {
            skills.splice(idx, 1);
            renderSkills();
          });
          skillsWrap.insertBefore(pill, skillInput);
        });
      }

      renderSkills();

      skillInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const v = skillInput.value.trim();
          if (v && !skills.includes(v)) skills.push(v);
          skillInput.value = '';
          renderSkills();
        }
        if (e.key === 'Backspace' && skillInput.value === '' && skills.length > 0) {
          skills.pop();
          renderSkills();
        }
      });

      skillInput.addEventListener('blur', () => {
        const v = skillInput.value.trim();
        if (v && !skills.includes(v)) {
          skills.push(v);
          skillInput.value = '';
          renderSkills();
        }
      });

      // Post Form
      document.getElementById('postBtn').addEventListener('click', function (e) {
        const form = document.getElementById('opportunityForm');
        if (form.checkValidity()) {
          const btn = this;
          btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Posting...';
          setTimeout(() => window.location.href = 'posted-opportunities.html', 800);
        } else {
          form.reportValidity();
        }
      });
    });

