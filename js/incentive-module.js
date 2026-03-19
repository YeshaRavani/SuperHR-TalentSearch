document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('professional-incentive-module');
    if (!container) return; // Ignore if page does not host the module

    // Get Active Policies
    const mode = localStorage.getItem('incentiveMode') || 'points';
    const hoursRule = parseInt(localStorage.getItem('hoursPerLeave')) || 8;

    // Hardcoded mock values per mode aligned with admin-side mocks
    let content = '';

    if (mode === 'points') {
        const currentPoints = 320;
        const nextThreshold = 500;
        const percent = Math.round((currentPoints / nextThreshold) * 100);

        content = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc">View your current organisation reward balance and progression.</p>
            </div>
            <div class="prof-incentive-grid">
                <div class="prof-metric-card primary-metric">
                    <div class="prof-metric-label">Current Balance</div>
                    <div class="prof-metric-value">${currentPoints} <span style="font-size:1.5rem; color:var(--ink-400);">pts</span></div>
                    <div class="prof-metric-sub">Top 15% of platform contributors this month.</div>
                </div>

                <div class="prof-support-grid">
                    <div class="prof-support-card">
                        <div class="prof-support-title">Monthly Contribution</div>
                        <div class="prof-support-desc">You have successfully participated in 3 approved platform initiatives this cycle.</div>
                    </div>
                </div>
            </div>
        `;
    } else if (mode === 'hours') {
        const approvedHours = 14;
        const leaveUnits = Math.floor(approvedHours / hoursRule);
        const remainder = approvedHours % hoursRule;
        const percent = Math.round((remainder / hoursRule) * 100);

        content = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc">View your approved hours worked and paid leave eligibility.</p>
            </div>
            <div class="prof-incentive-grid">
                <div class="prof-metric-card primary-metric">
                    <div class="prof-metric-label">Approved Hours</div>
                    <div class="prof-metric-value">${approvedHours} <span style="font-size:1.5rem; color:var(--ink-400);">hrs</span></div>
                    <div class="prof-metric-sub">Equivalent to <strong style="color:var(--ink-900);">${leaveUnits}</strong> paid leave unit(s) earned.</div>
                </div>

                <div class="prof-support-grid">
                    <div class="prof-support-card">
                        <div class="prof-support-title">Total Approved Leave</div>
                        <div class="prof-support-desc">You are currently eligible to request <strong style="color:var(--ink-900);">${leaveUnits}</strong> days of paid time off based on hours logged.</div>
                    </div>
                </div>
            </div>
        `;
    } else if (mode === 'money') {
        const currentMny = 4500;
        const nextBonus = 10000;
        const formattedMny = Number(currentMny).toLocaleString('en-IN');
        const formattedNext = Number(nextBonus).toLocaleString('en-IN');
        const percent = Math.round((currentMny / nextBonus) * 100);

        content = `
            <div class="section-header" style="margin-bottom:24px;">
                <h2 class="section-title">Reward Summary</h2>
                <p class="section-desc">View your approved financial rewards and compensation metrics.</p>
            </div>
            <div class="prof-incentive-grid">
                <div class="prof-metric-card primary-metric">
                    <div class="prof-metric-label">Reward Earned</div>
                    <div class="prof-metric-value"><span style="font-size:1.5rem; color:var(--ink-400);">₹</span>${formattedMny}</div>
                    <div class="prof-metric-sub">Total earned for all completed opportunities.</div>
                </div>

                <div class="prof-support-grid">
                    <div class="prof-support-card">
                        <div class="prof-support-title">Monthly Payouts</div>
                        <div class="prof-support-desc">Your approved compensation is disbursed automatically during the end-of-month pay cycle.</div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = content;
});
