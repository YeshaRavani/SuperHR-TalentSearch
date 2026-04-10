document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    if (navbar && scrollProgress) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');

            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
            scrollProgress.style.width = scrolled + "%";
        });
    }

    // Notifications
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
        });
        window.addEventListener('click', () => {
            if (notifDropdown.classList.contains('active')) notifDropdown.classList.remove('active');
        });
        notifDropdown.addEventListener('click', e => e.stopPropagation());
    }

    // Skills Tag Input
    let skills = ["Design Thinking"];
    const skillsWrap = document.getElementById('skillsWrap');
    const skillInput = document.getElementById('skillInput');

    function renderSkills() {
        if (!skillsWrap || !skillInput) return;
        // remove existing pills
        Array.from(skillsWrap.children).forEach(c => { if (c !== skillInput) skillsWrap.removeChild(c); });

        // insert pills before the input
        skills.forEach((s, idx) => {
            const pill = document.createElement('span');
            pill.className = 'skill-pill';
            pill.innerHTML = `${s} <button type="button">✕</button>`;
            pill.querySelector('button').addEventListener('click', () => {
                skills.splice(idx, 1);
                renderSkills();
            });
            skillsWrap.insertBefore(pill, skillInput);
        });
    }

    renderSkills();

    if (skillInput) {
        skillInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const v = skillInput.value.trim();
                if (v && !skills.includes(v)) skills.push(v);
                skillInput.value = '';
                renderSkills();
            }
            if (e.key === 'Backspace' && skillInput.value === '' && skills.length > 0) {
                skills.pop();
                renderSkills();
            }
        });

        skillInput.addEventListener('blur', () => {
            const v = skillInput.value.trim();
            if (v && !skills.includes(v)) {
                skills.push(v);
                skillInput.value = '';
                renderSkills();
            }
        });
    }

    // AI Assist Logic
    const aiDesc = document.getElementById('aiDescription');
    const generateBtn = document.getElementById('generateBtn');
    const micBtn = document.getElementById('micBtn');

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const text = aiDesc.value.trim();
            if (!text) return;
            
            generateBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Generating...';
            generateBtn.disabled = true;
            
            setTimeout(() => {
                extractOpportunityDetailsFromText(text);
                generateBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Generate Details';
                generateBtn.disabled = false;
            }, 1200);
        });
    }

    function extractOpportunityDetailsFromText(text) {
        const tLower = text.toLowerCase();
        let title = text.split(/[.?!]/)[0].substring(0, 60).trim();
        title = title.replace(/^(i need|need|looking for|we need)\s+/i, '');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        
        const knownSkills = ['Figma', 'Canva', 'Python', 'Design Processing', 'Data Analysis', 'React', 'HTML', 'Marketing', 'Writing', 'Research', 'UX', 'Social Media', 'Content Creation'];
        const extractedSkills = knownSkills.filter(s => tLower.includes(s.toLowerCase()));
        
        const xpMatch = text.match(/(\d+)\s*xp/i);
        const xp = xpMatch ? xpMatch[1] : '';
        
        let timeOpt = '';
        if (tLower.includes('1-2') || tLower.includes('1 to 2')) timeOpt = '1-2 hours / week';
        else if (tLower.includes('3-5') || tLower.includes('3 to 5')) timeOpt = '3-5 hours / week';
        else if (tLower.includes('5-10')) timeOpt = '5-10 hours / week';
        
        const scheduleMatch = text.match(/(next \w+|[2-3]\s*weeks?|tomorrow|this weekend)/i);
        const schedule = scheduleMatch ? scheduleMatch[1] : '';
        
        populateOpportunityForm({
            title: title,
            description: text,
            xp: xp,
            time: timeOpt,
            schedule: schedule ? schedule.charAt(0).toUpperCase() + schedule.slice(1) : '',
            skills: extractedSkills
        });
    }

    function populateOpportunityForm(data) {
        if (data.title) {
            const titleEl = document.getElementById('title');
            titleEl.value = data.title;
            titleEl.focus();
            titleEl.blur();
        }
        if (data.description) document.getElementById('description').value = data.description;
        if (data.xp) document.getElementById('bounty').value = data.xp;
        if (data.schedule) document.getElementById('schedule').value = data.schedule;
        if (data.time) {
            const timeInput = document.getElementById('timePerWeek');
            const timeChips = document.querySelectorAll('.time-chip');
            if (timeInput) timeInput.value = data.time;
            timeChips.forEach(c => {
                if (c.dataset.value === data.time) c.classList.add('active');
                else c.classList.remove('active');
            });
        }
        
        if (data.skills && data.skills.length > 0) {
            data.skills.forEach(s => {
                if (!skills.includes(s)) skills.push(s);
            });
            renderSkills();
        }
    }

    // Time Chips
    const timeInput = document.getElementById('timePerWeek');
    const timeChips = document.querySelectorAll('.time-chip');
    const customTimeInput = document.getElementById('customTimeInput');
    
    timeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            timeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            if (chip.dataset.value === 'Custom') {
                if (customTimeInput) {
                    customTimeInput.style.display = 'block';
                    timeInput.value = customTimeInput.value;
                    customTimeInput.focus();
                }
            } else {
                if (customTimeInput) customTimeInput.style.display = 'none';
                timeInput.value = chip.dataset.value;
            }
        });
    });

    // Form Submission
    const postBtn = document.getElementById('postBtn');
    if (postBtn) {
        postBtn.addEventListener('click', async function () {
            const form = document.getElementById('opportunityForm');
            if (!timeInput.value) {
                alert("Please select a time commitment.");
                return;
            }

            if (form.checkValidity()) {
                const originalHTML = postBtn.innerHTML;
                postBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Posting...';
                postBtn.disabled = true;

                const payload = {
                    title: document.getElementById('title').value,
                    short_description: document.getElementById('description').value,
                    full_description: document.getElementById('description').value,
                    schedule_time: document.getElementById('schedule').value,
                    points_reward: parseInt(document.getElementById('bounty').value) || 0,
                    time_required: timeInput.value,
                    location: 'Remote / TBD',
                    type: 'Initiative',
                    skills: skills,
                    expectations: ["Active participation", "On-time delivery"],
                    responsibilities: ["Contribute to milestones", "Collaborate with team"],
                    benefits: ["XP Rewards", "Skill Development"],
                    prerequisites: ["None"],
                    applied_count: 0,
                    main_icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>',
                    tag_icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
                    bg_gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    icon_color: '#0ea5e9'
                };

                try {
                    await api.post('/opportunities', payload);
                    window.location.href = 'posted-opportunities.html';
                } catch (err) {
                    console.error("Failed to post:", err);
                    alert("Failed to post: " + err.message);
                    postBtn.innerHTML = originalHTML;
                    postBtn.disabled = false;
                }
            } else {
                form.reportValidity();
            }
        });
    }
});
