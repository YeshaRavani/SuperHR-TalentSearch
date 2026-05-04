document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const timeInput = document.getElementById('timePerWeek');
    const customTimeInput = document.getElementById('customTimeInput');
    const postBtn = document.getElementById('postBtn');

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

    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            notifDropdown.classList.toggle('active');
        });
        window.addEventListener('click', () => notifDropdown.classList.remove('active'));
        notifDropdown.addEventListener('click', event => event.stopPropagation());
    }

    let skills = [];
    const skillsWrap = document.getElementById('skillsWrap');
    const skillInput = document.getElementById('skillInput');

    function normalizeSkill(value) {
        return value.trim().replace(/\s+/g, ' ');
    }

    function renderSkills() {
        if (!skillsWrap || !skillInput) return;
        Array.from(skillsWrap.children).forEach((child) => {
            if (child !== skillInput) skillsWrap.removeChild(child);
        });

        skills.forEach((skill, index) => {
            const pill = document.createElement('span');
            pill.className = 'skill-pill';
            pill.innerHTML = `${skill} <button type="button" aria-label="Remove ${skill}">x</button>`;
            pill.querySelector('button').addEventListener('click', () => {
                skills.splice(index, 1);
                renderSkills();
            });
            skillsWrap.insertBefore(pill, skillInput);
        });
    }

    function addSkill(value) {
        const skill = normalizeSkill(value);
        if (!skill) return;

        const exists = skills.some((item) => item.toLowerCase() === skill.toLowerCase());
        if (!exists) skills.push(skill);
        if (skillInput) skillInput.value = '';
        renderSkills();
    }

    if (skillInput) {
        skillInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                addSkill(skillInput.value);
            }
            if (event.key === 'Backspace' && skillInput.value === '' && skills.length > 0) {
                skills.pop();
                renderSkills();
            }
        });

        skillInput.addEventListener('blur', () => addSkill(skillInput.value));
    }

    const aiDesc = document.getElementById('aiDescription');
    const generateBtn = document.getElementById('generateBtn');

    if (generateBtn && aiDesc) {
        generateBtn.addEventListener('click', () => {
            const text = aiDesc.value.trim();
            if (!text) return;

            generateBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Generating...';
            generateBtn.disabled = true;

            setTimeout(() => {
                extractOpportunityDetailsFromText(text);
                generateBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Generate Details';
                generateBtn.disabled = false;
            }, 800);
        });
    }

    function inferType(text) {
        const lower = text.toLowerCase();
        if (lower.includes('workshop') || lower.includes('training') || lower.includes('session')) return 'Workshop';
        if (lower.includes('event') || lower.includes('sprint') || lower.includes('meetup')) return 'Event';
        return 'Initiative';
    }

    function extractOpportunityDetailsFromText(text) {
        const lower = text.toLowerCase();
        let title = text.split(/[.?!]/)[0].substring(0, 70).trim();
        title = title.replace(/^(i need|need|looking for|we need|seeking)\s+/i, '');
        title = title.charAt(0).toUpperCase() + title.slice(1);

        const knownSkills = [
            'Figma', 'Canva', 'Python', 'Data Analysis', 'React', 'HTML', 'CSS',
            'Marketing', 'Writing', 'Research', 'UX', 'Social Media',
            'Content Creation', 'Photography', 'Video Editing', 'AI',
        ];
        const extractedSkills = knownSkills.filter(skill => lower.includes(skill.toLowerCase()));
        const xpMatch = text.match(/(\d+)\s*(xp|points?)/i);
        const scheduleMatch = text.match(/(next \w+|[2-9]\s*weeks?|tomorrow|this weekend|this month|next month)/i);
        const locationMatch = text.match(/\b(?:at|in)\s+([A-Z][A-Za-z0-9\s-]{2,40})/);

        let time = '';
        if (lower.includes('less than 1') || lower.includes('< 1')) time = 'Less than 1 hour';
        else if (lower.includes('1-2') || lower.includes('1 to 2')) time = '1-2 hours / week';
        else if (lower.includes('3-5') || lower.includes('3 to 5')) time = '3-5 hours / week';
        else if (lower.includes('5-10') || lower.includes('5 to 10')) time = '5-10 hours / week';

        populateOpportunityForm({
            title,
            description: text,
            type: inferType(text),
            xp: xpMatch ? xpMatch[1] : '',
            time,
            schedule: scheduleMatch ? scheduleMatch[1] : '',
            location: locationMatch ? locationMatch[1].trim() : '',
            skills: extractedSkills,
        });
    }

    function populateOpportunityForm(data) {
        const titleEl = document.getElementById('title');
        const descriptionEl = document.getElementById('description');
        const bountyEl = document.getElementById('bounty');
        const scheduleEl = document.getElementById('schedule');
        const typeEl = document.getElementById('opportunityType');
        const locationEl = document.getElementById('location');

        if (data.title && titleEl) titleEl.value = data.title;
        if (data.description && descriptionEl) descriptionEl.value = data.description;
        if (data.xp && bountyEl) bountyEl.value = data.xp;
        if (data.schedule && scheduleEl) scheduleEl.value = data.schedule.charAt(0).toUpperCase() + data.schedule.slice(1);
        if (data.type && typeEl) typeEl.value = data.type;
        if (data.location && locationEl) locationEl.value = data.location;

        if (data.time && timeInput) {
            timeInput.value = data.time;
            document.querySelectorAll('.time-chip').forEach((chip) => {
                chip.classList.toggle('active', chip.dataset.value === data.time);
            });
            if (customTimeInput) customTimeInput.style.display = 'none';
        }

        (data.skills || []).forEach(addSkill);
    }

    document.querySelectorAll('.time-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.time-chip').forEach((item) => item.classList.remove('active'));
            chip.classList.add('active');

            if (chip.dataset.value === 'Custom') {
                if (customTimeInput) {
                    customTimeInput.style.display = 'block';
                    timeInput.value = customTimeInput.value.trim();
                    customTimeInput.focus();
                }
            } else {
                if (customTimeInput) customTimeInput.style.display = 'none';
                timeInput.value = chip.dataset.value;
            }
        });
    });

    if (customTimeInput && timeInput) {
        customTimeInput.addEventListener('input', () => {
            timeInput.value = customTimeInput.value.trim();
        });
    }

    function splitSentences(text) {
        return text
            .split(/[\n.;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function buildPayload() {
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const type = document.getElementById('opportunityType').value;
        const location = document.getElementById('location').value.trim();
        const schedule = document.getElementById('schedule').value.trim();
        const points = Number(document.getElementById('bounty').value);
        const timeRequired = timeInput.value.trim();
        const summary = description.length > 180 ? `${description.slice(0, 177).trim()}...` : description;
        const descriptionPoints = splitSentences(description);

        return {
            type,
            title,
            short_description: summary,
            full_description: description,
            image_url: null,
            schedule_time: schedule,
            location,
            points_reward: Number.isFinite(points) ? points : 0,
            time_required: timeRequired,
            expectations: descriptionPoints.slice(0, 3).length ? descriptionPoints.slice(0, 3) : ['Active participation'],
            responsibilities: [
                'Coordinate with the opportunity owner',
                'Share progress updates',
                'Complete agreed contribution tasks',
            ],
            benefits: [
                'Reward points',
                'Portfolio-ready collaboration experience',
                'Skill development',
            ],
            prerequisites: skills.length ? skills : ['Interest in contributing'],
            skills,
            main_icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>',
            tag_icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
            bg_gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            icon_color: '#0ea5e9',
        };
    }

    function validateBeforeSubmit(form) {
        if (!localStorage.getItem('access_token')) {
            window.location.href = 'login.html';
            return false;
        }
        if (!timeInput.value.trim()) {
            window.alert('Please select or enter a time commitment.');
            return false;
        }
        if (!skills.length) {
            window.alert('Please add at least one required skill.');
            skillInput?.focus();
            return false;
        }
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

    if (postBtn) {
        postBtn.addEventListener('click', async () => {
            const form = document.getElementById('opportunityForm');
            if (!validateBeforeSubmit(form)) return;

            const originalHTML = postBtn.innerHTML;
            postBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Posting...';
            postBtn.disabled = true;

            try {
                await api.post('/opportunities', buildPayload());
                window.location.href = 'posted-opportunities.html';
            } catch (err) {
                console.error('Failed to post opportunity:', err);
                window.alert(`Failed to post: ${err.message}`);
                postBtn.innerHTML = originalHTML;
                postBtn.disabled = false;
            }
        });
    }
});
