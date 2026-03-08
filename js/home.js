document.addEventListener('DOMContentLoaded', async () => {

            // Dynamically load user name
            try {
                const user = await api.get('/user');
                const nameSpan = document.getElementById('hero-user-name');
                if (nameSpan && user && user.full_name) {
                    nameSpan.textContent = user.full_name;
                }
            } catch (e) {}

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
                        // If it has counters inside, trigger them
                        const counters = entry.target.querySelectorAll('.counter');
                        if (counters.length) runCounters(counters);
                        observer.unobserve(entry.target);
                    }
                });
            }, revealOptions);

            revealElements.forEach(el => revealObserver.observe(el));

            // 4. Parallax Effect for Hero Dashboard
            const heroSection = document.querySelector('.hero');
            const widget = document.getElementById('parallaxWidget');

            heroSection.addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
                widget.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            });
            heroSection.addEventListener('mouseleave', () => {
                widget.style.transform = `rotateY(-10deg) rotateX(5deg)`;
                widget.style.transition = `transform 0.5s ease`;
            });
            heroSection.addEventListener('mouseenter', () => {
                widget.style.transition = `none`;
            });

            // 5. 3D Tilt Effect for Opportunity Cards
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

            // 6. Native JS Count-Up Animation
            const heroCounters = heroSection.querySelectorAll('.counter');
            runCounters(heroCounters); // Run hero immediately

            function runCounters(counters) {
                counters.forEach(counter => {
                    counter.innerText = '0';
                    const updateCounter = () => {
                        const target = +counter.getAttribute('data-target');
                        const c = +counter.innerText.replace(/[^0-9]/g, '');
                        // speed calc
                        const increment = target / 50;
                        if (c < target) {
                            counter.innerHTML = Math.ceil(c + increment) + (counter.innerHTML.includes('XP') ? ' <span>XP</span>' : '');
                            setTimeout(updateCounter, 20);
                        } else {
                            counter.innerHTML = target + (counter.innerHTML.includes('XP') ? ' <span>XP</span>' : '');
                        }
                    };
                    updateCounter();
                });
            }
        });

document.addEventListener('DOMContentLoaded', function () {
            const role = localStorage.getItem('userRole');
        });