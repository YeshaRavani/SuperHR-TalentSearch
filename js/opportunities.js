document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('opportunities-master-container');
  if (!list) return;

  // ── State ─────────────────────────────────────────
  let allOpportunities = [];
  let interestedList = [];
  let removedList = [];
  let selectedSkill = 'all';

  // ── Fetch Data (FROM TEAMMATE CODE) ───────────────
  try {
    allOpportunities = await api.get('/opportunities');
    renderAll();
  } catch (err) {
    console.error("Failed to load opportunities:", err);
  }

  // ── Render Function (MERGED) ──────────────────────
  function renderAll() {
    let filtered = allOpportunities.filter(o => {
      const id = String(o.id);

      if (removedList.includes(id)) return false;

      if (selectedSkill === 'Interested') {
        return interestedList.includes(id);
      }

      return selectedSkill === 'all' ||
        (o.expectations && o.expectations.includes(selectedSkill)) ||
        (o.title && o.title.includes(selectedSkill));
    });

    if (filtered.length === 0) {
      list.innerHTML = `<p>No opportunities found</p>`;
      return;
    }

    list.innerHTML = filtered.map(opp => `
      <div class="initiative-card" data-id="${opp.id}">
        <div class="card-image" style="background-image: url('${opp.image_url || ''}')">
          <div class="card-tag">${opp.type}</div>
        </div>
        <div class="card-content">
          <h3>${opp.title}</h3>
          <p>${opp.short_description}</p>
          <div class="card-meta">
            <span>${opp.schedule_time}</span>
            <span>${opp.location}</span>
            <span>+${opp.points_reward} pts</span>
          </div>
          <button class="interest-btn" data-id="${opp.id}">Interested</button>
          <button class="remove-btn" data-id="${opp.id}">Remove</button>
        </div>
      </div>
    `).join('');
  }

  // ── Click Handling ────────────────────────────────
  list.addEventListener('click', function (e) {
    const intBtn = e.target.closest('.interest-btn');
    const removeBtn = e.target.closest('.remove-btn');

    if (intBtn) {
      const id = String(intBtn.dataset.id);
      if (!interestedList.includes(id)) {
        interestedList.push(id);
        alert('Added to Interested!');
        renderAll();
      }
      return;
    }

    if (removeBtn) {
      const id = String(removeBtn.dataset.id);
      removedList.push(id);
      renderAll();
      return;
    }
  });

  // ── Filters ──────────────────────────────────────
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedSkill = card.dataset.skill;
      renderAll();
    });
  });
});