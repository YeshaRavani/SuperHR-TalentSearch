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

      // Navbar Scroll (from index (1).html logic)
      const navbar = document.getElementById('navbar');
      const scrollProgress = document.getElementById('scrollProgress');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20 && navbar) {
          navbar.classList.add('scrolled');
        } else if (navbar) {
          navbar.classList.remove('scrolled');
        }

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = scrolled + "%";
      });
    })();

