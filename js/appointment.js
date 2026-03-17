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

      // Form Logic
      const people = [
        { name: "Aarav Mehta", role: "Startup Mentor", status: "Available", statusClass: "" },
        { name: "Diya Kapoor", role: "Program Lead", status: "Available", statusClass: "" },
        { name: "Rohan Iyer", role: "Industry Advisor", status: "Limited", statusClass: "limited" },
        { name: "Meera Singh", role: "Career Coach", status: "Available", statusClass: "" },
        { name: "Nikhil Rao", role: "Product Guide", status: "Busy", statusClass: "busy" },
      ];

      const peopleList = document.getElementById("people-list");
      const searchInput = document.getElementById("person-search");

      function renderPeople(filter) {
        peopleList.innerHTML = "";
        const normalized = (filter || "").toLowerCase();
        const filtered = people.filter(p =>
          p.name.toLowerCase().includes(normalized) ||
          p.role.toLowerCase().includes(normalized)
        );

        if (filtered.length === 0 && filter !== "") {
          peopleList.innerHTML = '<div style="color:var(--ink-500); padding:10px 16px; font-size:0.9rem;">No matches found</div>';
          return;
        }

        filtered.forEach((person, index) => {
          const initials = person.name.split(' ').map(n => n[0]).join('');
          const card = document.createElement("div");
          card.className = "person-card";

          let actionHTML = '';
          if (person.status === 'Invite Sent') {
            actionHTML = `<span class="badge" style="background:#ecfdf5; color:#10b981; border-color:#d1fae5;">Invite Sent</span>`;
          } else {
            actionHTML = `<button class="btn btn-sky" style="height:36px; padding:0 16px; font-size:0.85rem;" onclick="openInviteModal(${index})">Send Invite</button>`;
          }

          card.innerHTML = `
                        <div class="person-info">
                            <div class="person-avatar">${initials}</div>
                            <div class="person-meta">
                                <strong>${person.name}</strong>
                                <span>${person.role}</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                           ${person.status !== 'Invite Sent' && person.status !== 'Available' ? `<span class="badge ${person.statusClass}">${person.status}</span>` : ''}
                           ${actionHTML}
                        </div>
                    `;
          peopleList.appendChild(card);
        });
      }

      renderPeople("");
      searchInput.addEventListener("input", e => renderPeople(e.target.value));

      // Modal Logic exposing globally
      let selectedPersonIndex = null;

      window.openInviteModal = function (index) {
        selectedPersonIndex = index;
        document.getElementById('modal-person-name').textContent = people[index].name;
        document.getElementById('invite-topic').value = '';
        document.getElementById('invite-msg').value = '';
        document.getElementById('invite-reason').value = '';
        document.getElementById('invite-time').value = '';
        // Pre-fill today's date as default/minimum
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invite-date').min = today;
        document.getElementById('invite-date').value = today;
        document.getElementById('inviteModal').classList.add('active');
        document.body.style.overflow = 'hidden';
      };

      window.closeInviteModal = function () {
        document.getElementById('inviteModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        selectedPersonIndex = null;
      };

      window.submitInviteForm = function () {
        if (selectedPersonIndex === null) return;

        const btn = document.getElementById('modal-submit-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sending...';
        btn.style.opacity = '0.8';

        setTimeout(() => {
          // Mock state
          const person = people[selectedPersonIndex];
          person.status = 'Invite Sent';
          person.statusClass = '';

          // Gather all fields
          const topic  = document.getElementById('invite-topic').value;
          const reason = document.getElementById('invite-reason').value;
          const date   = document.getElementById('invite-date').value;
          const time   = document.getElementById('invite-time').value;
          const notes  = document.getElementById('invite-msg').value.trim();

          // Format date nicely
          const dateLabel = date
            ? new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
            : '';
          const timeLabel = time
            ? new Date('1970-01-01T' + time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '';

          // Log logic
          const container = document.getElementById('sent-invites-container');
          const emptyMsg = document.getElementById('empty-invites-msg');
          if (emptyMsg) emptyMsg.remove();

          const logItem = document.createElement('div');
          logItem.className = 'invite-log-card';
          logItem.innerHTML = `
              <div class="invite-log-info">
                <strong>${person.name}</strong>
                <span>${reason} &mdash; ${topic}</span>
                <span style="font-size:0.82rem; color:var(--ink-400); margin-top:2px; display:block;">
                  📅 ${dateLabel} &nbsp;·&nbsp; ⏰ ${timeLabel}
                  ${notes ? `<br>📝 ${notes}` : ''}
                </span>
              </div>
              <span class="badge" style="background:#ecfdf5; color:#10b981; border-color:#d1fae5; flex-shrink:0;">Invite Sent</span>
            `;
          container.prepend(logItem);

          // Close and reset
          btn.innerHTML = originalText;
          btn.style.opacity = '1';
          closeInviteModal();
          renderPeople(searchInput.value); // Re-render to show updated badge
        }, 800);
      };

    });

