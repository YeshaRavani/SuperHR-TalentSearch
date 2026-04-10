document.addEventListener('DOMContentLoaded', async () => {
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    const badge = document.getElementById('notifBadge');
    const markBtn = document.getElementById('markAllReadBtn');

    const maintenanceModeToggle = document.getElementById('maintenanceModeToggle');
    const autoApproveToggle = document.getElementById('autoApproveToggle');
    const publicProfilesToggle = document.getElementById('publicProfilesToggle');
    const require2faToggle = document.getElementById('require2faToggle');
    const sessionTimeoutSelect = document.getElementById('sessionTimeoutSelect');
    const saveBtn = document.getElementById('saveSystemSettingsBtn');
    const statusEl = document.getElementById('systemSettingsStatus');

    let currentSettings = null;

    function initChrome() {
        window.addEventListener('scroll', () => {
            if (navbar) {
                if (window.scrollY > 20) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            }

            if (scrollProgress) {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
                scrollProgress.style.width = `${scrolled}%`;
            }
        });

        if (notifToggle && notifDropdown) {
            notifToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                notifDropdown.classList.toggle('active');
            });
            window.addEventListener('click', () => notifDropdown.classList.remove('active'));
            notifDropdown.addEventListener('click', (e) => e.stopPropagation());
        }

        if (markBtn && badge) {
            markBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                badge.style.display = 'none';
                document.querySelectorAll('.notif-item').forEach((item) => {
                    item.style.opacity = '0.6';
                });
            });
        }
    }

    function setStatus(message, isError = false) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.style.color = isError ? '#ef4444' : 'var(--ink-500)';
    }

    function readForm() {
        return {
            maintenance_mode: Boolean(maintenanceModeToggle?.checked),
            auto_approve_opportunities: Boolean(autoApproveToggle?.checked),
            allow_public_profiles: Boolean(publicProfilesToggle?.checked),
            require_2fa_for_admins: Boolean(require2faToggle?.checked),
            session_timeout_minutes: Number(sessionTimeoutSelect?.value || 30),
        };
    }

    function applySettings(settings) {
        if (!settings) return;
        maintenanceModeToggle.checked = settings.maintenance_mode;
        autoApproveToggle.checked = settings.auto_approve_opportunities;
        publicProfilesToggle.checked = settings.allow_public_profiles;
        require2faToggle.checked = settings.require_2fa_for_admins;
        sessionTimeoutSelect.value = String(settings.session_timeout_minutes);
    }

    async function loadSettings() {
        try {
            currentSettings = await window.api.get('/admin/system-settings');
            applySettings(currentSettings);
            setStatus('Loaded saved platform settings.');
        } catch (err) {
            console.error('Failed to load admin system settings:', err);
            setStatus(err.message || 'Failed to load system settings.', true);
        }
    }

    async function saveSettings() {
        const payload = readForm();
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            currentSettings = await window.api.put('/admin/system-settings', payload);
            applySettings(currentSettings);
            setStatus('System settings saved.');
        } catch (err) {
            console.error('Failed to save admin system settings:', err);
            setStatus(err.message || 'Failed to save system settings.', true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save All Settings';
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }

    initChrome();
    await loadSettings();
});
