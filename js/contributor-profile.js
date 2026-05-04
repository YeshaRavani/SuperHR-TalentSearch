document.addEventListener('DOMContentLoaded', async () => {
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    const profileOrg = document.getElementById('profile-org');
    const profileRole = document.getElementById('profile-role');
    
    // Skill Management Elements
    const skillsContainer = document.getElementById('skillsContainer');
    const newSkillInput = document.getElementById('newSkillInput');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const resumeInput = document.querySelector('input[type="file"][accept=".pdf,.doc,.docx"]');
    const uploadDisplay = resumeInput?.previousElementSibling;
    
    // Profile Picture Elements
    const profilePicInput = document.getElementById('profilePicInput');
    const imagePreview = document.getElementById('imagePreview');
    
    let extractedSkills = [];
    let profilePhotoBase64 = null;

    // Load initial user data
    try {
        const user = await api.get('/user');
        if (profileName) profileName.textContent = user.full_name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileOrg) profileOrg.textContent = user.organisation || 'SuperHR';
        if (profileRole) profileRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        
        if (user.skills && user.skills.length > 0) {
            extractedSkills = user.skills;
            renderSkills();
        }

        // Load applications
        const apps = await api.get('/applications');
        renderApplications(apps);
    } catch (err) {
        console.error("Profile init failed:", err);
    }

    function renderApplications(apps) {
        const list = document.getElementById('applications-list');
        if (!list) return;
        list.innerHTML = '';
        
        if (apps.length === 0) {
            list.innerHTML = '<p class="empty-state">No applications found.</p>';
            return;
        }

        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'app-item';
            item.innerHTML = `
                <div class="app-info">
                    <div class="app-title">${app.opportunity_id}</div>
                    <div class="app-status status-${app.status}">${app.status}</div>
                </div>
                <div class="app-date">${new Date(app.created_at).toLocaleDateString()}</div>
            `;
            list.appendChild(item);
        });
    }

    // --- Skill Chip Rendering ---
    function renderSkills() {
        if (!skillsContainer) return;
        
        if (extractedSkills.length === 0) {
            skillsContainer.innerHTML = '<p class="empty-state" style="color: var(--ink-400); font-size: 0.9rem; margin: auto;">No skills added yet. Upload resume to auto-extract.</p>';
            return;
        }

        skillsContainer.innerHTML = '';
        extractedSkills.forEach((skill, index) => {
            const chip = document.createElement('div');
            chip.className = 'skill-chip';
            chip.innerHTML = `
                ${skill}
                <span class="remove-skill" data-index="${index}">&times;</span>
            `;
            skillsContainer.appendChild(chip);
        });
    }

    // --- Skill Actions ---
    function addSkill(skillName) {
        const name = skillName.trim();
        if (name && !extractedSkills.includes(name)) {
            extractedSkills.push(name);
            renderSkills();
        }
        newSkillInput.value = '';
    }

    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', () => addSkill(newSkillInput.value));
    }

    if (newSkillInput) {
        newSkillInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(newSkillInput.value);
            }
        });
    }

    if (skillsContainer) {
        skillsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-skill')) {
                const index = parseInt(e.target.dataset.index);
                extractedSkills.splice(index, 1);
                renderSkills();
            }
        });
    }

    // --- Profile Picture Preview ---
    if (profilePicInput) {
        profilePicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    profilePhotoBase64 = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Resume AI Extraction Logic ---
    if (resumeInput) {
        resumeInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Check file type
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                alert("Currently, automated skill extraction only supports PDF files. For Word docs, please add your skills manually.");
                return;
            }

            // Visual feedback
            const originalText = uploadDisplay ? uploadDisplay.innerHTML : 'Processing...';
            if (uploadDisplay) uploadDisplay.innerHTML = '<span style="color: #007bff; font-weight: 500; animation: pulse 1.5s infinite;">AI is analyzing your resume...</span>';
            
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post('/ai/extract-skills', formData);
                
                if (response.error) {
                    throw new Error(response.error);
                }

                if (response.skills && response.skills.length > 0) {
                    // Merge new skills with existing ones, avoiding duplicates
                    response.skills.forEach(skill => {
                        if (!extractedSkills.includes(skill)) {
                            extractedSkills.push(skill);
                        }
                    });
                    
                    renderSkills();
                    
                    if (uploadDisplay) uploadDisplay.innerHTML = `<span style="color: #28a745; font-weight: 500;">✓ ${response.skills.length} skills extracted</span>`;
                    
                    // Highlight the skills container
                    skillsContainer.style.borderColor = '#28a745';
                    skillsContainer.style.boxShadow = '0 0 0 4px rgba(40, 167, 69, 0.1)';
                    setTimeout(() => {
                        skillsContainer.style.borderColor = '';
                        skillsContainer.style.boxShadow = '';
                    }, 3000);
                } else {
                    if (uploadDisplay) uploadDisplay.innerHTML = '<span style="color: #dc3545;">No skills detected.</span>';
                    setTimeout(() => uploadDisplay.innerHTML = originalText, 3000);
                }
            } catch (err) {
                console.error("Resume extraction failed:", err);
                if (uploadDisplay) uploadDisplay.innerHTML = `<span style="color: #dc3545;">AI Error: ${err.message || 'Check logs'}</span>`;
                setTimeout(() => uploadDisplay.innerHTML = originalText, 5000);
            }
        });
    }

    // --- Handle form submission ---
    const form = document.querySelector('.form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Visual feedback on button
            const finishBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = finishBtn.textContent;
            finishBtn.disabled = true;
            finishBtn.textContent = 'Saving Profile...';

            try {
                const payload = {
                    skills: extractedSkills
                };

                if (profilePhotoBase64) {
                    payload.profile_photo_url = profilePhotoBase64;
                }

                await api.put('/user', payload);
                localStorage.setItem('userRole', 'user');
                window.location.href = 'dashboard.html';
            } catch (err) {
                console.error("Failed to save profile:", err);
                alert("Failed to save profile. Please try again.");
                finishBtn.disabled = false;
                finishBtn.textContent = originalBtnText;
            }
        });
    }
});