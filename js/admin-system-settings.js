document.addEventListener('DOMContentLoaded', () => {

            // 1. Navbar Scroll & Progress Bar
            const navbar = document.getElementById('navbar');
            const scrollProgress = document.getElementById('scrollProgress');

            window.addEventListener('scroll', () => {
                // Navbar style toggle
                if (window.scrollY > 20) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');

                // Progress bar calc
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                scrollProgress.style.width = scrolled + "%";
            });

            // 2. Notification Dropdown Toggle
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

            // 3. Reveal Animations on Scroll
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

            // 4. Removed unused Parallax
            // 5. Removed unused Tilt Object
            const tiltCards = document.querySelectorAll('.tilt-card');
            tiltCards.forEach(card => {
                card.addEventListener('mousemove', e => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
                    const rotateY = ((x - centerX) / centerX) * 10;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                    card.style.transition = `transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)`;
                });
                card.addEventListener('mouseenter', () => {
                    card.style.transition = `none`;
                });
            });

            // 6. Removed JS counters code.
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