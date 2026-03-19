document.addEventListener('DOMContentLoaded', () => {
      // Navbar Scroll
      const navbar = document.getElementById('navbar');
      const scrollProgress = document.getElementById('scrollProgress');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
        scrollProgress.style.width = scrolled + "%";
      });

      // Notifications
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

      // Skills Tag Input
      let skills = ["Design Thinking"];
      const skillsWrap = document.getElementById('skillsWrap');
      const skillInput = document.getElementById('skillInput');

      function renderSkills() {
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
          
          // Simulate network delay for AI
          setTimeout(() => {
            extractOpportunityDetailsFromText(text);
            generateBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Generate Details';
            generateBtn.disabled = false;
          }, 1200);
        });
      }

      function extractOpportunityDetailsFromText(text) {
        const tLower = text.toLowerCase();
        
        // 1. Title heuristic (first sentence/clause)
        let title = text.split(/[.?!]/)[0].substring(0, 60).trim();
        if (title.length < text.length && !text.includes('.')) title += '...';
        title = title.replace(/^(i need|need|looking for|we need)\s+/i, '');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        
        // 2. Skills heuristic
        const knownSkills = ['Figma', 'Canva', 'Python', 'Design Processing', 'Data Analysis', 'React', 'HTML', 'Marketing', 'Writing', 'Research', 'UX', 'Social Media', 'Content Creation'];
        const extractedSkills = knownSkills.filter(s => tLower.includes(s.toLowerCase()));
        
        // 3. XP heuristic
        const xpMatch = text.match(/(\d+)\s*xp/i);
        const xp = xpMatch ? xpMatch[1] : '';
        
        // 4. Time commitment heuristic
        let timeOpt = '';
        if (tLower.includes('1-2') || tLower.includes('1 to 2') || tLower.includes('1 - 2')) timeOpt = '1-2 hours / week';
        else if (tLower.includes('3-5') || tLower.includes('3 to 5') || tLower.includes('3 - 5')) timeOpt = '3-5 hours / week';
        else if (tLower.includes('5-10') || tLower.includes('5 to 10')) timeOpt = '5-10 hours / week';
        
        // 5. Schedule heuristic
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
          titleEl.focus(); // trigger floating label
          titleEl.blur();
        }
        if (data.description) document.getElementById('description').value = data.description;
        if (data.xp) document.getElementById('bounty').value = data.xp;
        if (data.schedule) document.getElementById('schedule').value = data.schedule;
        if (data.time) {
          const timeInput = document.getElementById('timePerWeek');
          const timeChips = document.querySelectorAll('.time-chip');
          timeInput.value = data.time;
          timeChips.forEach(c => {
            if (c.dataset.value === data.time) c.classList.add('active');
            else c.classList.remove('active');
          });
        }
        
        if (data.skills && data.skills.length > 0) {
          // Add to global skills array correctly
          data.skills.forEach(s => {
            if (!skills.includes(s)) skills.push(s);
          });
          renderSkills();
        }
      }

      // Voice Simulation logic (Mock or Web Speech API)
      let isListening = false;
      if (micBtn) {
        micBtn.addEventListener('click', () => {
          if (!isListening) {
            isListening = true;
            micBtn.classList.add('listening');
            
            try {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                
                recognition.onresult = (e) => {
                  const transcript = e.results[0][0].transcript;
                  aiDesc.value += (aiDesc.value ? ' ' : '') + transcript;
                  stopListening();
                };
                recognition.onerror = () => stopListening();
                recognition.onend = () => stopListening();
                
                recognition.start();
              } else {
                simulateVoiceInput();
              }
            } catch (e) {
              simulateVoiceInput();
            }
          } else {
            stopListening();
          }
        });
      }

      function stopListening() {
        isListening = false;
        if(micBtn) micBtn.classList.remove('listening');
      }

      function simulateVoiceInput() {
        // Fallback mock if browser doesn't support SpeechRecognition cleanly
        setTimeout(() => {
          aiDesc.value = "We need a Marketing student to help design social media posts for our sustainability sprint over the next 2 weeks. Should know Figma or Canva. Roughly 3-5 hours a week. Reward around 300 XP.";
          stopListening();
        }, 2000);
      }

      // Time Chips Interaction Logic
      const timeInput = document.getElementById('timePerWeek');
      const timeChips = document.querySelectorAll('.time-chip');
      const customTimeInput = document.getElementById('customTimeInput');
      
      timeChips.forEach(chip => {
        chip.addEventListener('click', () => {
          timeChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          
          if (chip.dataset.value === 'Custom') {
            customTimeInput.style.display = 'block';
            timeInput.value = customTimeInput.value;
            customTimeInput.focus();
          } else {
            customTimeInput.style.display = 'none';
            timeInput.value = chip.dataset.value;
          }
          timeInput.setCustomValidity(''); 
        });
      });

      if(customTimeInput) {
        customTimeInput.addEventListener('input', (e) => {
          const activeChip = Array.from(timeChips).find(c => c.classList.contains('active'));
          if(activeChip && activeChip.dataset.value === 'Custom') {
            timeInput.value = e.target.value;
            if(e.target.value.trim() !== '') timeInput.setCustomValidity('');
          }
        });
      }

      // Post Form
      document.getElementById('postBtn').addEventListener('click', function (e) {
        const form = document.getElementById('opportunityForm');
        
        // Custom check for Time Commitment pseudo-input
        if (!timeInput.value) {
          timeInput.setCustomValidity('Please select a time commitment.');
        } else {
          timeInput.setCustomValidity('');
        }

        if (form.checkValidity()) {
          const btn = this;
          btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Posting...';
          setTimeout(() => window.location.href = 'posted-opportunities.html', 800);
        } else {
          form.reportValidity();
        }
      });
    });

