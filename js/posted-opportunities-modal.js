
function openResumeModal(name, avatar, role, skills, bullets, matchScore) {
  document.getElementById('rm-name').innerText = name;
  document.getElementById('rm-avatar').innerText = avatar;
  document.getElementById('rm-role').innerText = role;

  const skillsContainer = document.getElementById('rm-skills');
  skillsContainer.innerHTML = '';
  skills.forEach(s => {
    let span = document.createElement('span');
    span.className = 'resume-skill';
    span.innerText = s;
    skillsContainer.appendChild(span);
  });

  const bulletsContainer = document.getElementById('rm-bullets');
  bulletsContainer.innerHTML = '';
  bullets.forEach(b => {
    let div = document.createElement('div');
    div.className = 'resume-bullet';
    div.innerText = b;
    bulletsContainer.appendChild(div);
  });

  const modal = document.getElementById('resumeModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  document.getElementById('resumeModal').classList.remove('active');
  document.body.style.overflow = '';
}

window.openResumeModal = openResumeModal;
window.closeResumeModal = closeResumeModal;
