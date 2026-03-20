document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('opportunities-master-container');
  if (!container) return;

  // ── State ─────────────────────────────────────────
  let allOpportunities = [];
  let interestedList = ['curated-startup', 'curated-uiux', 'curated-content', 'curated-event'];
  let removedList = [];
  let selectedSkill = 'all';

  // ── Fetch Data (FROM TEAMMATE CODE) with Fallback ──
  try {
    allOpportunities = await api.get('/opportunities');
  } catch (err) {
    console.error("Failed to load opportunities from API:", err);
    // Fallback to static data from opportunities_data.js
    allOpportunities = window.superHrOpportunities || [];
  }

  // Set active tab on start from HTML
  const activeChip = document.querySelector('#skillsFilter .skill-card.active');
  if (activeChip) {
    selectedSkill = activeChip.dataset.skill;
  }

  // ── Render ─────────────────────────────────────────
  function renderAll() {
    let html = '';

    // Update dynamic skill counts
    const counts = {};
    allOpportunities.forEach(o => {
      if (o.skills) {
        o.skills.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
      }
    });

    counts['Interested'] = interestedList.length;

    document.querySelectorAll('#skillsFilter .skill-card').forEach(card => {
      const skill = card.dataset.skill;
      const countSpan = card.querySelector('.skill-count');
      if (countSpan && counts[skill] !== undefined) {
        countSpan.textContent = `(${counts[skill]})`;
      }
    });

    // Main Pool Filter 
    const items = allOpportunities.filter(o => {
      const id = String(o.id || o.title);
      if (removedList.includes(id)) return false;
      if (selectedSkill === 'Interested') return interestedList.includes(id);
      return selectedSkill === 'all' || (o.skills && o.skills.includes(selectedSkill));
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
              <div class="category-section reveal active ${selectedSkill === 'Interested' ? 'is-interested-view' : ''}" id="filtered-grid">
                <h2 class="category-title">${selectedSkill === 'all' ? 'All Opportunities' : `${selectedSkill} Opportunities`}</h2>
                <section class="initiatives-grid">${sectionContent}</section>
              </div>`;

    container.innerHTML = html;

    // Re-trigger reveal animations for dynamic cards and page elements
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ── Click Handling ────────────────────────────────
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
      renderAll(); // Re-render to hide
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

  // ── Skill Card Filters ─────────────────────────────
  const skillCards = document.querySelectorAll('#skillsFilter .skill-card');
  skillCards.forEach(card => {
    if (card.tagName.toLowerCase() === 'a' && card.getAttribute('href')) return;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      skillCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedSkill = card.dataset.skill;
      renderAll();
    });
  });

  // ── Initial Render ─────────────────────────────────
  renderAll();
});

document.addEventListener('DOMContentLoaded', () => {
  // Navbar Scroll
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');

      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
      if (scrollProgress) scrollProgress.style.width = scrolled + "%";
    });
  }

  // Notifications
  const notifToggle = document.getElementById('notifToggle');
  const notifDropdown = document.getElementById('notifDropdown');
  if (notifToggle && notifDropdown) {
    notifToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('active');
    });
    window.addEventListener('click', () => {
      if (notifDropdown.classList.contains('active')) notifDropdown.classList.remove('active');
    });
    notifDropdown.addEventListener('click', e => e.stopPropagation());
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const role = localStorage.getItem('userRole');
  if (role === 'admin') {
    document.body.classList.add('is-admin');
  }
});