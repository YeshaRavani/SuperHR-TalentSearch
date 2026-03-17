/**
 * header.js — Shared header interaction script for Talent Search
 * Include this in every page: <script src="js/header.js"></script>
 *
 * Handles:
 *  - Scroll-based topbar .scrolled class
 *  - Scroll-progress bar (looks for #scrollProgress)
 *  - Notification bell toggle (supports both #notifToggle and .notification-toggle)
 *  - Notification dropdown outside-click close
 *  - Escape key close
 */

(function () {
  'use strict';

  /** Wait for DOM to be ready before wiring everything */
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {

    /* ── Topbar scroll effect ─────────────────────────────────────────────── */
    var navbar = document.getElementById('navbar') || document.querySelector('.topbar');
    var progressBar = document.getElementById('scrollProgress');

    if (navbar || progressBar) {
      window.addEventListener('scroll', function () {
        var scrollY = window.scrollY || window.pageYOffset;

        // Scrolled class
        if (navbar) {
          if (scrollY > 20) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        }

        // Progress bar
        if (progressBar) {
          var total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          var pct   = total > 0 ? (scrollY / total) * 100 : 0;
          progressBar.style.width = pct + '%';
        }
      }, { passive: true });
    }

    /* ── Notification bell toggles ─────────────────────────────────────────── */
    /**
     * Supports three patterns used across pages:
     *  A) #notifToggle + #notifDropdown   (index/home/admin-home pattern)
     *  B) .notification-toggle + .notification-panel inside .notification-wrap
     */

    // ── Pattern A ────────────────────────────────────────────────────────────
    var bellA   = document.getElementById('notifToggle');
    var panelA  = document.getElementById('notifDropdown') || document.getElementById('notifPanel');

    if (bellA && panelA) {
      bellA.setAttribute('aria-haspopup', 'true');
      bellA.setAttribute('aria-expanded', 'false');

      bellA.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = panelA.classList.toggle('active');
        bellA.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      document.addEventListener('click', function () {
        if (panelA.classList.contains('active')) {
          panelA.classList.remove('active');
          bellA.setAttribute('aria-expanded', 'false');
        }
      });

      panelA.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    // ── Pattern B ────────────────────────────────────────────────────────────
    document.querySelectorAll('.notification-wrap, .notif-wrapper').forEach(function (wrap) {
      var toggle = wrap.querySelector('.notification-toggle') || wrap.querySelector('.icon-btn');
      var panel  = wrap.querySelector('.notification-panel') || wrap.querySelector('.notif-dropdown');
      if (!toggle || !panel) return;

      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-expanded', 'false');

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = panel.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });

      document.addEventListener('click', function () {
        if (panel.classList.contains('open')) {
          panel.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // ── Global Escape key ────────────────────────────────────────────────────
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;

      // Pattern A
      if (panelA && panelA.classList.contains('active')) {
        panelA.classList.remove('active');
        if (bellA) bellA.setAttribute('aria-expanded', 'false');
      }

      // Pattern B
      document.querySelectorAll('.notification-panel.open, .notif-dropdown.open').forEach(function (p) {
        p.classList.remove('open');
        var t = p.closest('.notification-wrap, .notif-wrapper');
        if (t) {
          var btn = t.querySelector('.notification-toggle, .icon-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    /* ── Mark-all-read badge clear ──────────────────────────────────────────── */
    var markAllBtn = document.getElementById('markAllReadBtn') ||
                     document.querySelector('.notif-clear');
    var badge      = document.getElementById('notifBadge');

    if (markAllBtn && badge) {
      markAllBtn.addEventListener('click', function () {
        badge.style.display = 'none';
      });
    }

  }); // end ready()

})();
