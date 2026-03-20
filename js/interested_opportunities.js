document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('opportunities-master-container');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // ── State (sessionStorage → resets on hard reload) ─────────────────
  const SESSION_KEY = 'opp_interested_ids';
  function getInterested() {
    try { return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }
  function saveInterested(set) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  }

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
  let selectedSkill = 'Interested';

  function renderAll() {
    if (!container || !window.superHrOpportunities) return;

    const interested = getInterested();
    let html = '';

    // Update dynamic skill counts once
    const counts = {};
    window.superHrOpportunities.forEach(o => {
      if (o.skills) {
        o.skills.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
      }
    });

    // 1. My Interested Opportunities section (top)
    const interestedOpps = [...interested]
      .map(id => window.superHrOpportunities.find(o => String(o.id || o.title) === String(id)))
      .filter(o => o && (selectedSkill === 'all' || (o.skills && o.skills.includes(selectedSkill))));

    if (interestedOpps.length > 0) {
      html += `
                <div class="category-section reveal active" id="my-interested">
                  <h2 class="category-title" style="color:var(--sky-600);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--sky-400)" style="margin-right:4px;flex-shrink:0;">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
                    </svg>
                    My Interested ${selectedSkill === 'all' ? '' : selectedSkill} Opportunities
                  </h2>
                  <section class="initiatives-grid">
                    ${interestedOpps.map((opp, i) => window.generateOpportunityCardHTML(opp, i % 4, true)).join('')}
                  </section>
                </div>`;
    }

    // 2. Filtered Main Pool
    const items = window.superHrOpportunities.filter(o =>
      (selectedSkill === 'all' || (o.skills && o.skills.includes(selectedSkill))) &&
      !interested.has(String(o.id || o.title))
    );

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

    // Custom text override for Interested page buttons
    container.querySelectorAll('.interest-btn').forEach(btn => {
      btn.textContent = "Remove Interest";
      btn.classList.add('remove-interest-btn');
    });
  }

  // ── Event delegation (single permanent listener on container) ──────
  container.addEventListener('click', function (e) {
    const btn = e.target.closest('.interest-btn');

    if (btn) {
      e.preventDefault();
      e.stopPropagation();

      const card = btn.closest('.initiative-card');
      if (card) {
        card.style.display = 'none';
        showToast('Removed from your interested list (Temporary)');
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