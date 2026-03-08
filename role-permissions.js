// Role-Based Access Control logic for Talent Search Platform

document.addEventListener('DOMContentLoaded', function () {
    const userRole = localStorage.getItem('userRole');
    const path = window.location.pathname;

    function enforceRBAC() {
        // Helper functions for hiding elements
        function hideElements(selector) {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
            });
        }

        // 2. Head of Department Logic
        if (userRole === 'head') {
            hideElements('a[href*="apply"], button[data-action="apply"], .apply-btn');
            document.querySelectorAll('.btn, button, a').forEach(btn => {
                const text = btn.textContent.trim().toLowerCase();
                if (text === 'apply' || text === 'interested' || text.includes('enroll')) {
                    btn.style.display = 'none';
                }
            });
        }

        // 3. Employee Logic
        if (userRole === 'employee') {
            hideElements('a[href="posted-opportunities.html"]');
            hideElements('a[href="add-opportunity.html"]');
            document.querySelectorAll('.btn, button, a').forEach(btn => {
                const text = btn.textContent.trim().toLowerCase();
                if (text === 'post opportunity' || text === 'post new opportunity') {
                    btn.style.display = 'none';
                }
            });
        }
    }

    // 1. Initial Enforcement (covers Static HTML)
    enforceRBAC();

    // 2. Continuous Enforcement (covers Dynamic Javascript Rendering via opportunities_data.js)
    const observer = new MutationObserver(() => {
        enforceRBAC();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 3. Routing Blocks
    if (userRole === 'employee' && path.includes('posted-opportunities.html')) {
        window.location.href = 'opportunities.html';
    }
});
