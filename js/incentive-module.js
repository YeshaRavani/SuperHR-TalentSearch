document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('professional-incentive-module');
    if (!container) return;

    function formatNumber(value, options = {}) {
        return Number(value || 0).toLocaleString('en-IN', options);
    }

    function renderLoggedOut() {
        container.innerHTML = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc">Log in to view your current reward balance and progression.</p>
            </div>
            <div class="prof-incentive-grid">
                <div class="prof-metric-card primary-metric">
                    <div class="prof-metric-label">Current Balance</div>
                    <div class="prof-metric-value">--</div>
                    <div class="prof-metric-sub">Your rewards are loaded from your backend profile after login.</div>
                </div>
                <div class="prof-support-grid">
                    <div class="prof-support-card">
                        <div class="prof-support-title">Sign in required</div>
                        <div class="prof-support-desc">Use your account to track points, leave eligibility, and reward policy.</div>
                        <a href="login.html" class="btn btn-sky" style="height:40px; padding:0 20px; display:inline-flex; align-items:center; text-decoration:none;">Login</a>
                    </div>
                </div>
            </div>
        `;
    }

    function renderPoints(summary) {
        const nextThreshold = Math.max(Math.ceil((summary.total_points + 1) / 500) * 500, 500);
        const percent = Math.min(Math.round((summary.total_points / nextThreshold) * 100), 100);

        container.innerHTML = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc">View your current organisation reward balance and progression.</p>
            </div>
            <div class="prof-incentive-grid">
                <div class="prof-metric-card primary-metric">
                    <div class="prof-metric-label">Current Balance</div>
                    <div class="prof-metric-value">${formatNumber(summary.total_points)} <span style="font-size:1.5rem; color:var(--ink-400);">pts</span></div>
                    <div class="prof-metric-sub">Loaded from your backend reward profile.</div>
                </div>

                <div class="prof-support-grid">
                    <div class="prof-support-card">
                        <div class="prof-support-title">Next Milestone</div>
                        <div class="prof-support-desc">${formatNumber(summary.total_points)} of ${formatNumber(nextThreshold)} points earned.</div>
                        <div class="prof-progress-bar"><div class="prof-progress-fill" style="width:${percent}%;"></div></div>
                        <div class="prof-support-meta"><span>${percent}% complete</span><span>${formatNumber(nextThreshold - summary.total_points)} pts to go</span></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderHours(summary) {
        const earnedUnits = Number(summary.leave_hours_available || 0);
        const completedUnits = Math.floor(earnedUnits);
        const percent = Math.min(Math.round((earnedUnits - completedUnits) * 100), 100);

        container.innerHTML = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc">View paid leave eligibility based on the active reward policy.</p>
            </div>
            <div class="prof-incentive-grid">
                <div class="prof-metric-card primary-metric">
                    <div class="prof-metric-label">Leave Units Available</div>
                    <div class="prof-metric-value">${formatNumber(earnedUnits, { maximumFractionDigits: 2 })}</div>
                    <div class="prof-metric-sub">${formatNumber(summary.total_points)} points using ${summary.hours_per_leave} points per leave unit.</div>
                </div>

                <div class="prof-support-grid">
                    <div class="prof-support-card">
                        <div class="prof-support-title">Conversion Rule</div>
                        <div class="prof-support-desc">${summary.hours_per_leave} reward points = 1 leave unit.</div>
                        <div class="prof-progress-bar"><div class="prof-progress-fill success" style="width:${percent}%;"></div></div>
                        <div class="prof-support-meta"><span>${completedUnits} full unit(s)</span><span>${percent}% toward next unit</span></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderMoney(summary) {
        const amount = Number(summary.total_points || 0) * 10;
        const nextBonus = Math.max(Math.ceil((amount + 1) / 10000) * 10000, 10000);
        const percent = Math.min(Math.round((amount / nextBonus) * 100), 100);

        container.innerHTML = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc">View your point-derived financial reward estimate.</p>
            </div>
            <div class="prof-incentive-grid">
                <div class="prof-metric-card primary-metric">
                    <div class="prof-metric-label">Reward Equivalent</div>
                    <div class="prof-metric-value"><span style="font-size:1.5rem; color:var(--ink-400);">₹</span>${formatNumber(amount)}</div>
                    <div class="prof-metric-sub">Derived from ${formatNumber(summary.total_points)} backend reward points.</div>
                </div>

                <div class="prof-support-grid">
                    <div class="prof-support-card">
                        <div class="prof-support-title">Next Bonus Band</div>
                        <div class="prof-support-desc">Estimated progress toward ₹${formatNumber(nextBonus)}.</div>
                        <div class="prof-progress-bar"><div class="prof-progress-fill" style="width:${percent}%;"></div></div>
                        <div class="prof-support-meta"><span>${percent}% complete</span><span>₹${formatNumber(nextBonus - amount)} to go</span></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderError(message) {
        container.innerHTML = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc" style="color:#ef4444;">${message || 'Unable to load reward summary.'}</p>
            </div>
        `;
    }

    if (!localStorage.getItem('access_token')) {
        renderLoggedOut();
        return;
    }

    try {
        const summary = await api.get('/rewards/me');
        if (summary.active_mode === 'hours') {
            renderHours(summary);
        } else if (summary.active_mode === 'money') {
            renderMoney(summary);
        } else {
            renderPoints(summary);
        }
    } catch (err) {
        renderError(err.message);
    }
});
