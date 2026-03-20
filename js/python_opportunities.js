document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('opportunities-master-container');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // ── State (Memory locked → resets on reload) ─────────────────────
  let interestedList = [];
  let removedList = [];

  // ── Toast ──────────────────────────────────────────────────────────
  function showToast(msg) {
    let t = document.getElementById('opp-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'opp-toast';
      Object.assign(t.style, {
        position: 'fixed', bottom: '32px', left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: 'var(--ink-900)', color: '#fff',
        padding: '10px 22px', borderRadius: '999px',
        fontSize: '0.9rem', fontWeight: '600', zIndex: '9999',
        boxShadow: '0 8px 24px rgba(15,31,43,0.18)',
        opacity: '0', transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: 'none', whiteSpace: 'nowrap'
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
  }

  // ── Render ─────────────────────────────────────────────────────────
  let selectedSkill = 'Python';

  function renderAll() {
    if (!container || !window.superHrOpportunities) return;

    let html = '';

    // Update dynamic skill counts once
    const counts = {};
    window.superHrOpportunities.forEach(o => {
      if (o.skills) {
        o.skills.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
      }
    });

    // Main Pool Filter 
    const items = window.superHrOpportunities.filter(o => {
      const id = String(o.id || o.title);

      // Exclude Removed Items
      if (removedList.includes(id)) return false;

      if (selectedSkill === 'Interested') {
        return interestedList.includes(id);
      }

      const isSkillMatch = selectedSkill === 'all' || (o.skills && o.skills.includes(selectedSkill));
      return isSkillMatch;
    });

    let sectionContent = '';
    if (items.length > 0) {
      sectionContent = items.map((opp, idx) =>
        window.generateOpportunityCardHTML(opp, idx % 4, false)
      ).join('');
    } else {
      sectionContent = `<p style="color:var(--ink-400);font-size:0.95rem;padding:16px 0;">No ${selectedSkill === 'all' ? '' : selectedSkill + ' '}opportunities found matching selection.</p>`;
    }

    html += `
              <div class="category-section reveal active" id="filtered-grid">
                <h2 class="category-title">${selectedSkill === 'all' ? 'All Opportunities' : `${selectedSkill} Opportunities`}</h2>
                <section class="initiatives-grid">${sectionContent}</section>
              </div>`;

    container.innerHTML = html;
  }

  // ── Event delegation (single permanent listener on container) ──────
  container.addEventListener('click', function (e) {
    const intBtn = e.target.closest('.interest-btn');
    const removeBtn = e.target.closest('.remove-btn');

    if (intBtn) {
      e.preventDefault();
      e.stopPropagation();

      const id = String(intBtn.dataset.id);

      if (!interestedList.includes(id)) {
        interestedList.push(id);
        alert('Added to Interested!');
        renderAll();
      }
      return;
    }

    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();

      const id = String(removeBtn.dataset.id);

      if (!removedList.includes(id)) {
        removedList.push(id);
      }

      const card = removeBtn.closest('.initiative-card');
      if (card) {
        card.style.display = 'none';
      }
      return;
    }

    const card = e.target.closest('.initiative-card');
    if (card) {
      const link = card.querySelector('.card-link');
      if (link) {
        window.location.href = link.href;
      }
    }
  });

  // ── Initial render ─────────────────────────────────────────────────
  renderAll();

  // Skill Card Filters Removed

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

  // Hide Interested buttons for admins via body class (CSS rule: body.is-admin .card-hover-actions { display:none })
  if (role === 'admin') {
    document.body.classList.add('is-admin');
  }

});