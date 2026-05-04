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
    const role = localStorage.getItem('userRole');
    const form = document.querySelector('.form');
    if (form) {
        form.addEventListener('submit', handleSignupNext);
    }
});

async function handleSignupNext(e) {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const org = document.getElementById('organization').value;
    const idnum = document.getElementById('idnumber').value;
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (pass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalBtnText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = "Creating Account...";

    try {
        const sanitizedEmail = user.toLowerCase().replace(/\s+/g, '.') + '@example.com';
        await api.post('/signup', {
            username: user,
            email: sanitizedEmail,
            full_name: fullname,
            password: pass,
            role: 'contributors',
            organisation: org,
            department_team: 'General'
        });

        // Auto-login after signup
        await api.login(user, pass);
        
        // Redirect to profile setup (resume upload) instead of dashboard
        window.location.href = 'contributor-profile.html';
    } catch (err) {
        alert("Signup failed: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }
}
window.handleSignupNext = handleSignupNext;