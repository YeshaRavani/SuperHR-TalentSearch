(function () {
      // notification dropdown behaviour
      document.querySelectorAll('.notification-wrap').forEach(function (wrap) {
        var toggle = wrap.querySelector('.notification-toggle');
        var panel = wrap.querySelector('.notification-panel');
        if (!toggle || !panel) return;
        toggle.addEventListener('click', function (e) { e.stopPropagation(); var isOpen = panel.classList.toggle('open'); toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); });
        panel.addEventListener('click', function (e) { e.stopPropagation(); });
        document.addEventListener('click', function () { panel.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { panel.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } });
      });

      var finishBtn = document.getElementById('finishBtn');
      finishBtn.addEventListener('click', function () { window.location.href = 'index (1).html'; });
    })();

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