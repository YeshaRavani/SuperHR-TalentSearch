window.generateOpportunityCardHTML = function (opp, indexDelay = 0) {
    const delayStyle = indexDelay > 0 ? `style="transition-delay: ${indexDelay * 0.1}s;"` : '';
    const animDelayClass = indexDelay > 0 ? `delay-${indexDelay}` : '';

    return `
        <article class="initiative-card reveal ${animDelayClass}" ${delayStyle}>
            <div class="card-link" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; height:100%;">
                <div class="card-image" aria-hidden="true" style="background: ${opp.bgGradient};">
                    <div class="card-icon-overlay" style="color: ${opp.iconColor};">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${opp.mainIcon}
                        </svg>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${opp.title}</h3>
                    <p>${opp.description}</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                ${opp.tagIcon}
                            </svg>
                            ${opp.dateStr}
                        </span>
                        <span class="tag" style="background:var(--white); border-color:var(--sky-200); color:var(--ink-700);">
                            ${opp.category}
                        </span>
                        <span class="tag" style="background:var(--sky-50); border-color:var(--sky-200); color:var(--ink-800); font-weight: 600;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Enrolled: ${opp.enrolledCount || 0}
                        </span>
                    </div>
                    <div style="border-top: 1px solid rgba(15,31,43,0.05); padding-top: 16px; margin-top: 16px;">
                        <button onclick="this.closest('article').remove();" class="btn" style="width: 100%; height: 40px; border-radius: 999px; font-weight: 600; cursor: pointer; border: 1px solid #fca5a5; background: #fee2e2; color: #ef4444; transition: 0.3s; z-index: 10; position: relative;">Remove Opportunity</button>
                    </div>
                </div>
            </div>
        </article>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
          const container = document.getElementById('opportunities-master-container');
          const filterBtns = document.querySelectorAll('.filter-btn');

          function renderAll() {
            if (!container || !window.superHrOpportunities) return;

            let html = '';

            const categories = [
              { key: 'Event', title: 'Events', viewKey: 'events' },
              { key: 'Initiative', title: 'Initiatives', viewKey: 'initiatives' },
              { key: 'Workshop', title: 'Workshops', viewKey: 'workshops' }
            ];

            categories.forEach(cat => {
              const items = window.superHrOpportunities.filter(o => o.category === cat.key);
              if (items.length > 0) {
                html += `
                  <div class="category-section reveal active" id="${cat.viewKey}">
                    <h2 class="category-title">${cat.title}</h2>
                    <section class="initiatives-grid">
                      ${items.map((opp, index) => window.generateOpportunityCardHTML(opp, index % 4)).join('')}
                    </section>
                  </div>
                `;
              }
            });

            container.innerHTML = html;
          }

          renderAll(); // Always render everything so we can scroll to them

          filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              // Update Active UI States
              filterBtns.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
            });
          });
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

document.addEventListener('DOMContentLoaded', () => {
        const markBtn = document.getElementById('markAllReadBtn');
        const badge = document.getElementById('notifBadge');
        if (markBtn && badge) {
            markBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                badge.style.display = 'none';
                document.querySelectorAll('.notif-item').forEach(item => {
                    item.style.opacity = '0.6';
                });
            });
        }
    });