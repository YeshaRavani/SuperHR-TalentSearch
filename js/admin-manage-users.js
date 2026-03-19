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

// Organisation Incentive Policy Logic
document.addEventListener('DOMContentLoaded', () => {
    const policyCards = document.querySelectorAll('.policy-card');
    const contextContainer = document.getElementById('incentiveContext');
    const userCells = document.querySelectorAll('.incentive-cell');
    const savePolicyBtn = document.getElementById('savePolicyBtn');
    const policySummary = document.getElementById('policySummary');

    // Default state: official policy
    let state = {
        mode: localStorage.getItem('incentiveMode') || 'points',
        hoursPerLeave: parseInt(localStorage.getItem('hoursPerLeave')) || 8
    };

    // Pending selection state
    let pendingMode = state.mode;

    function renderContext() {
        if (!contextContainer) return;
        
        // Context only appears specifically for 'hours' because it requires configuration
        if (state.mode === 'hours') {
            contextContainer.style.display = 'flex';
            contextContainer.innerHTML = `
                <div class="conversion-inline">
                    <span>Active Conversion Rule:</span>
                    <input type="number" id="hoursInput" class="conversion-input" value="${state.hoursPerLeave}" min="1">
                    <span>hours worked = 1 paid leave unit</span>
                </div>
            `;
            const hoursInput = document.getElementById('hoursInput');
            if (hoursInput) {
                hoursInput.addEventListener('change', (e) => {
                    let val = parseInt(e.target.value);
                    if (val && val > 0) {
                        state.hoursPerLeave = val;
                        localStorage.setItem('hoursPerLeave', val);
                        renderUserCells();
                        updateSummary();
                    }
                });
            }
        } else {
            contextContainer.style.display = 'none';
        }
    }

    function renderUserCells() {
        if (!userCells) return;
        userCells.forEach(cell => {
            const pts = cell.getAttribute('data-points') || 0;
            const hrs = parseFloat(cell.getAttribute('data-hours') || 0);
            const mny = cell.getAttribute('data-money') || 0;

            if (state.mode === 'points') {
                cell.innerHTML = `<strong>${pts}</strong> points`;
            } else if (state.mode === 'money') {
                const formattedMny = Number(mny).toLocaleString('en-IN');
                cell.innerHTML = `<strong>₹${formattedMny}</strong> earned`;
            } else if (state.mode === 'hours') {
                const leaves = (hrs / state.hoursPerLeave).toFixed(1);
                // Simplify rendering like "1.0" to "1"
                const cleanLeaves = leaves.endsWith('.0') ? leaves.slice(0, -2) : leaves;
                
                let badgeHtml = '';
                if (hrs >= state.hoursPerLeave) {
                    badgeHtml = `<span style="display:inline-block; margin-top:4px; font-size:0.75rem; background:#dcfce7; color:#166534; padding:2px 8px; border-radius:999px;">Eligible for leave</span>`;
                }

                cell.innerHTML = `
                    <div style="line-height:1.4;">
                        <strong>${hrs}</strong> hours logged
                        <div style="font-size:0.85rem; color:var(--ink-500);">= ${cleanLeaves} paid leave units</div>
                        ${badgeHtml}
                    </div>
                `;
            }
        });
    }

    function updateSummary() {
        if (!policySummary) return;
        
        const modeLabels = {
            'points': 'Points',
            'hours': 'Hours Worked',
            'money': 'Money'
        };
        
        let html = `Current policy: <strong>${modeLabels[state.mode]}</strong>`;
        if (state.mode === 'hours') {
            html += `<br><span style="font-weight:400; font-size: 0.85rem; color:var(--ink-500);">Conversion rule: ${state.hoursPerLeave} hours = 1 paid leave</span>`;
        }
        policySummary.innerHTML = html;
    }

    function setPendingCard(mode) {
        pendingMode = mode;
        policyCards.forEach(card => {
            if (card.getAttribute('data-mode') === pendingMode) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        // Enable save button if the selection represents a structural policy change
        if (pendingMode !== state.mode) {
            savePolicyBtn.disabled = false;
            savePolicyBtn.textContent = 'Save Policy Change';
        } else {
            savePolicyBtn.disabled = true;
            savePolicyBtn.textContent = 'Policy Saved';
        }
    }

    // Bind card clicks
    policyCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.getAttribute('data-mode');
            if (mode) {
                setPendingCard(mode);
            }
        });
    });
    
    // Bind save button
    if (savePolicyBtn) {
        savePolicyBtn.addEventListener('click', () => {
            if (pendingMode && pendingMode !== state.mode) {
                // Commit the policy
                state.mode = pendingMode;
                localStorage.setItem('incentiveMode', state.mode);
                
                // Re-render UI
                setPendingCard(state.mode);
                updateSummary();
                renderContext();
                renderUserCells();
            }
        });
    }

    // Initialize display
    if(policyCards.length > 0) {
        setPendingCard(state.mode);
        updateSummary();
        renderContext();
        renderUserCells();
    }
});