document.addEventListener('DOMContentLoaded', () => {
            // Scroll Progress
            const scrollProgress = document.getElementById('scrollProgress');
            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                scrollProgress.style.width = scrolled + "%";
            });

            // Notification Dropdown Toggle
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

            // Number Counters
            const counters = document.querySelectorAll('.counter');
            counters.forEach(counter => {
                counter.innerText = '0';
                const updateCounter = () => {
                    const target = +counter.getAttribute('data-target');
                    const c = +counter.innerText.replace(/[^0-9]/g, '');
                    const increment = target / 50;
                    if (c < target) {
                        counter.innerText = Math.ceil(c + increment);
                        setTimeout(updateCounter, 20);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });

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

            // RBAC Enforce (Optional basic local rules if applied via component logic)
            const role = localStorage.getItem('userRole');
            if (role === 'employee') {
                document.querySelectorAll('a[href="posted-opportunities.html"], a[href="add-opportunity.html"]').forEach(el => el.style.display = 'none');
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