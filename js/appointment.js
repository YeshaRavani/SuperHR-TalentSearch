document.addEventListener('DOMContentLoaded', async () => {
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const peopleList = document.getElementById('people-list');
  const searchInput = document.getElementById('person-search');
  const invitesContainer = document.getElementById('sent-invites-container');
  const modal = document.getElementById('inviteModal');
  const modalPersonName = document.getElementById('modal-person-name');
  const submitBtn = document.getElementById('modal-submit-btn');

  let currentUser = null;
  let people = [];
  let invitations = [];
  let selectedPerson = null;

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 20) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }

    if (scrollProgress) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      scrollProgress.style.width = `${scrolled}%`;
    }
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initials(name) {
    return (name || '?')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getUserRoleLabel(user) {
    return (user.role || 'user').replaceAll('_', ' ');
  }

  function getInviteForPerson(person) {
    return invitations.find((invite) => (
      invite.sender_id === currentUser.id && invite.receiver_id === person.id
    ));
  }

  function renderPeople(filter = '') {
    if (!peopleList) return;

    const normalized = filter.trim().toLowerCase();
    const filtered = people.filter((person) => {
      const haystack = [
        person.full_name,
        person.username,
        person.email,
        person.organisation,
        person.department_team,
        person.role,
      ].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });

    if (!filtered.length) {
      peopleList.innerHTML = `
        <div style="color:var(--ink-500); padding:10px 16px; font-size:0.9rem;">
          ${normalized ? 'No matches found.' : 'No other platform members available.'}
        </div>
      `;
      return;
    }

    peopleList.innerHTML = filtered.map((person) => {
      const invite = getInviteForPerson(person);
      const inviteStatus = invite ? invite.status : '';
      const disabled = inviteStatus === 'pending';
      const buttonLabel = inviteStatus === 'pending' ? 'Invite Sent' : 'Send Invite';
      const statusBadge = inviteStatus && inviteStatus !== 'pending'
        ? `<span class="badge ${inviteStatus === 'accepted' ? '' : 'busy'}">${escapeHtml(inviteStatus)}</span>`
        : '';

      return `
        <div class="person-card">
          <div class="person-info">
            <div class="person-avatar">${escapeHtml(initials(person.full_name || person.username))}</div>
            <div class="person-meta">
              <strong>${escapeHtml(person.full_name || person.username)}</strong>
              <span>${escapeHtml(person.department_team || person.organisation || getUserRoleLabel(person))}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            ${statusBadge}
            <button class="btn btn-sky invite-person-btn" data-user-id="${escapeHtml(person.id)}"
              style="height:36px; padding:0 16px; font-size:0.85rem;" ${disabled ? 'disabled' : ''}>
              ${buttonLabel}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function invitationPerson(invite) {
    const otherId = invite.sender_id === currentUser.id ? invite.receiver_id : invite.sender_id;
    return people.find((person) => person.id === otherId);
  }

  function statusStyle(status) {
    if (status === 'accepted') return 'background:#eff6ff; color:#2563eb; border-color:#bfdbfe;';
    if (status === 'declined') return 'background:#fee2e2; color:#ef4444; border-color:#fecaca;';
    return 'background:#ecfdf5; color:#10b981; border-color:#d1fae5;';
  }

  function renderInvitations() {
    if (!invitesContainer) return;

    if (!invitations.length) {
      invitesContainer.innerHTML = `
        <div id="empty-invites-msg" class="invite-log-card">
          <div class="invite-log-info">
            <strong>No meetings yet</strong>
            <span>Send an invite to a platform member to start scheduling.</span>
          </div>
        </div>
      `;
      return;
    }

    invitesContainer.innerHTML = invitations.map((invite) => {
      const person = invitationPerson(invite);
      const isSent = invite.sender_id === currentUser.id;
      const personName = person ? (person.full_name || person.username) : (isSent ? invite.receiver_id : invite.sender_id);
      const direction = isSent ? 'Sent to' : 'Received from';
      const actionControls = !isSent && invite.status === 'pending'
        ? `
          <div style="display:flex; gap:8px; flex-shrink:0;">
            <button class="btn btn-sky invitation-status-btn" data-id="${escapeHtml(invite.id)}" data-status="accepted" style="height:32px; padding:0 12px; font-size:0.8rem;">Accept</button>
            <button class="btn btn-secondary invitation-status-btn" data-id="${escapeHtml(invite.id)}" data-status="declined" style="height:32px; padding:0 12px; font-size:0.8rem;">Decline</button>
          </div>
        `
        : `<span class="badge" style="${statusStyle(invite.status)} flex-shrink:0;">${escapeHtml(invite.status)}</span>`;

      return `
        <div class="invite-log-card">
          <div class="invite-log-info">
            <strong>${escapeHtml(direction)} ${escapeHtml(personName)}</strong>
            <span>${escapeHtml(invite.topic)}</span>
            <span style="font-size:0.82rem; color:var(--ink-400); margin-top:4px; display:block;">
              ${escapeHtml(invite.message || 'No additional notes.')}
            </span>
          </div>
          ${actionControls}
        </div>
      `;
    }).join('');
  }

  window.openInviteModal = function (userId) {
    selectedPerson = people.find((person) => person.id === userId);
    if (!selectedPerson) return;

    modalPersonName.textContent = selectedPerson.full_name || selectedPerson.username;
    document.getElementById('invite-topic').value = '';
    document.getElementById('invite-msg').value = '';
    document.getElementById('invite-reason').value = '';
    document.getElementById('invite-time').value = '';

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('invite-date');
    dateInput.min = today;
    dateInput.value = today;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeInviteModal = function () {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    selectedPerson = null;
  };

  window.submitInviteForm = async function () {
    if (!selectedPerson) return;

    const topic = document.getElementById('invite-topic').value.trim();
    const reason = document.getElementById('invite-reason').value;
    const date = document.getElementById('invite-date').value;
    const time = document.getElementById('invite-time').value;
    const notes = document.getElementById('invite-msg').value.trim();

    const dateLabel = date
      ? new Date(`${date}T00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    const timeLabel = time
      ? new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '';

    const messageParts = [
      reason ? `Reason: ${reason}` : '',
      dateLabel || timeLabel ? `Schedule: ${dateLabel}${timeLabel ? ` at ${timeLabel}` : ''}` : '',
      notes ? `Notes: ${notes}` : '',
    ].filter(Boolean);

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    try {
      await api.post('/invitations', {
        receiver_id: selectedPerson.id,
        topic,
        message: messageParts.join(' | ') || 'Meeting invitation',
      });

      await loadInvitations();
      renderPeople(searchInput.value);
      window.closeInviteModal();
    } catch (err) {
      window.alert(err.message || 'Could not send invite.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  };

  async function loadPeople() {
    peopleList.innerHTML = '<div style="color:var(--ink-500); padding:10px 16px; font-size:0.9rem;">Loading members...</div>';
    const members = await api.get('/community/members');
    people = members.filter((member) => member.id !== currentUser.id);
  }

  async function loadInvitations() {
    invitations = await api.get('/invitations');
    renderInvitations();
  }

  peopleList?.addEventListener('click', (event) => {
    const button = event.target.closest('.invite-person-btn');
    if (!button || button.disabled) return;
    window.openInviteModal(button.dataset.userId);
  });

  invitesContainer?.addEventListener('click', async (event) => {
    const button = event.target.closest('.invitation-status-btn');
    if (!button) return;

    button.disabled = true;
    try {
      await api.put(`/invitations/${button.dataset.id}`, { status: button.dataset.status });
      await loadInvitations();
    } catch (err) {
      window.alert(err.message || 'Could not update invite.');
      button.disabled = false;
    }
  });

  searchInput?.addEventListener('input', (event) => renderPeople(event.target.value));

  try {
    currentUser = await api.get('/user');
    await loadPeople();
    await loadInvitations();
    renderPeople('');
  } catch (err) {
    console.error('Appointment page failed to load:', err);
    if (peopleList) {
      peopleList.innerHTML = '<div style="color:#ef4444; padding:10px 16px; font-size:0.9rem;">Please log in to schedule appointments.</div>';
    }
    if (invitesContainer) {
      invitesContainer.innerHTML = '';
    }
  }
});
