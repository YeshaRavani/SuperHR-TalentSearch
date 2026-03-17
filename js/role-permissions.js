// Role-Based Access Control and shared UI behavior for Talent Search Platform

(function () {
    function hideElements(selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            el.style.display = 'none';
        });
    }

    function normalizeNotificationStyles() {
        if (document.getElementById('notification-unified-styles')) return;

        var style = document.createElement('style');
        style.id = 'notification-unified-styles';
        style.textContent = [
            '.notif-dropdown, .notification-panel {',
            '  position: absolute;',
            '  top: calc(100% + 14px);',
            '  right: 0;',
            '  width: min(340px, calc(100vw - 24px));',
            '  max-height: 420px;',
            '  overflow-y: auto;',
            '  z-index: 1200;',
            '  display: none;',
            '  background: rgba(255, 255, 255, 0.98);',
            '  backdrop-filter: blur(20px);',
            '  border-radius: var(--radius-lg, 16px);',
            '  padding: 20px;',
            '  box-shadow: 0 10px 40px rgba(15, 31, 43, 0.08);',
            '  border: 1px solid rgba(15, 31, 43, 0.08);',
            '}',
            '.notif-dropdown.active, .notif-dropdown.open, .notification-panel.active, .notification-panel.open {',
            '  display: block;',
            '}',
            '.notification-wrap, .notif-wrap, .notif-wrapper { position: relative; }'
        ].join('\n');
        document.head.appendChild(style);
    }

    function findNotificationPairs() {
        var pairs = [];
        var seen = new Set();

        var toggles = Array.from(document.querySelectorAll(
            '#notifToggle, .notification-toggle, button[aria-label="Notifications"]'
        ));

        toggles.forEach(function (toggle) {
            var panel = null;
            var controls = toggle.getAttribute('aria-controls');
            if (controls) panel = document.getElementById(controls);

            if (!panel) {
                var wrap = toggle.closest('.notification-wrap, .notif-wrap');
                if (wrap) panel = wrap.querySelector('.notification-panel, .notif-dropdown, #notifDropdown');
            }

            if (!panel) {
                var parent = toggle.parentElement;
                if (parent) panel = parent.querySelector('.notification-panel, .notif-dropdown, #notifDropdown');
            }

            if (!panel) panel = document.getElementById('notifDropdown');
            if (!panel) return;

            var key = String(toggle) + '::' + String(panel);
            if (seen.has(key)) return;
            seen.add(key);

            // Ensure absolute panel is positioned relative to its immediate container.
            var host = panel.parentElement;
            if (host && getComputedStyle(host).position === 'static') {
                host.style.position = 'relative';
            }

            pairs.push({ toggle: toggle, panel: panel });
        });

        return pairs;
    }

    function closeAllPanels(pairs) {
        pairs.forEach(function (pair) {
            pair.panel.classList.remove('active', 'open');
            pair.toggle.setAttribute('aria-expanded', 'false');
        });
    }

    function initUnifiedNotifications() {
        normalizeNotificationStyles();

        var pairs = findNotificationPairs();
        if (!pairs.length) return;

        closeAllPanels(pairs);

        pairs.forEach(function (pair) {
            pair.toggle.setAttribute('aria-haspopup', 'true');
            pair.toggle.setAttribute('aria-expanded', 'false');

            // Capture-phase handler to prevent page-specific scripts from applying different behavior.
            pair.toggle.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                var isOpen = pair.panel.classList.contains('active') || pair.panel.classList.contains('open');
                closeAllPanels(pairs);
                if (!isOpen) {
                    pair.panel.classList.add('active', 'open');
                    pair.toggle.setAttribute('aria-expanded', 'true');
                }
            }, true);

            pair.panel.addEventListener('click', function (event) {
                event.stopPropagation();
            }, true);
        });

        document.addEventListener('click', function () {
            closeAllPanels(pairs);
        }, true);

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeAllPanels(pairs);
        });
    }

    function enforceRBAC() {
        var userRole = localStorage.getItem('userRole');
        var path = window.location.pathname;

        if (userRole === 'head_of_department') {
            hideElements('a[href*="apply"], button[data-action="apply"], .apply-btn');
            document.querySelectorAll('.btn, button, a').forEach(function (btn) {
                var text = btn.textContent.trim().toLowerCase();
                if (text === 'apply' || text === 'interested' || text.includes('enroll')) {
                    btn.style.display = 'none';
                }
            });
        }

        if (userRole === 'admin') {
            document.querySelectorAll('.btn, button, a').forEach(function (btn) {
                var text = btn.textContent.trim().toLowerCase();
                if (text === 'apply' || text === 'interested' || text.includes('enroll')) {
                    btn.style.display = 'none';
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        enforceRBAC();
        initUnifiedNotifications();

        var observer = new MutationObserver(function () {
            enforceRBAC();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
