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

    // Navbar Scroll
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

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.querySelector('input[type="file"]');
    const form = document.querySelector('form');
    const teamInput = document.getElementById('team');

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = function () {
                    localStorage.setItem('adminProfileImage', reader.result);
                    const display = document.querySelector('.file-upload-display');
                    if (display) {
                        display.innerHTML = `<img src="${reader.result}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" /> Image Selected`;
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (teamInput) {
                localStorage.setItem('adminTeam', teamInput.value);
            }
            localStorage.setItem('userRole', 'admin');
            window.location.href = 'admin-home.html';
        });
    }
});
