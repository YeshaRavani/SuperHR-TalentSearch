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
    const micBtn = document.getElementById('micBtn');

    // ── Speech Recognition ──
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn && aiDesc) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        let isListening = false;
        let finalTranscript = '';

        micBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
                return;
            }
            finalTranscript = aiDesc.value; // Start from current text
            recognition.start();
        });

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('active');
            micBtn.style.background = 'var(--red-100)';
            micBtn.style.color = 'var(--red-600)';
            micBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pulse"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>';
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            aiDesc.value = (finalTranscript + interimTranscript).trim();
            aiDesc.scrollTop = aiDesc.scrollHeight; // Auto-scroll to bottom
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('active');
            micBtn.style.background = '';
            micBtn.style.color = '';
            micBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>';
        };
    } else if (micBtn) {
        micBtn.style.display = 'none'; 
    }

    if (generateBtn && aiDesc) {
        generateBtn.addEventListener('click', async () => {
            const text = aiDesc.value.trim();
            if (!text) return;

            const originalBtnHtml = generateBtn.innerHTML;
            generateBtn.innerHTML = '<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> AI Analyzing...';
            generateBtn.disabled = true;

            try {
                const data = await api.post('/ai/parse-opportunity', { description: text });
                
                // Clear existing skills before adding new ones
                skills = [];
                renderSkills();
                
                populateOpportunityForm({
                    title: data.title,
                    description: data.description,
                    type: data.type,
                    xp: data.bounty,
                    time: data.time_commitment,
                    schedule: data.schedule,
                    location: data.location,
                    skills: data.skills,
                });
            } catch (err) {
                console.error("AI Parsing failed:", err);
                alert("AI Extraction failed. Please try again or fill manually.");
            } finally {
                generateBtn.innerHTML = originalBtnHtml;
                generateBtn.disabled = false;
            }
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
