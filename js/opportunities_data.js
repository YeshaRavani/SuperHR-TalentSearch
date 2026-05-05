// Unified Data Source for SuperHR-TalentSearch Opportunities
// This feeds the opportunity detail and listing pages.

window.superHrOpportunities = [];

// Helper method to generate the HTML string for a single card based on the defined data format
window.generateOpportunityCardHTML = function (opp, indexDelay = 0, inInterestedSection = false, isInterestedPage = false) {
    const delayStyle = indexDelay > 0 ? `style="transition-delay: ${indexDelay * 0.1}s;"` : '';
    const animDelayClass = indexDelay > 0 ? `delay-${indexDelay}` : '';
    const oppId = opp.id || opp.title;
    const onInterestedPage = isInterestedPage || window.location.pathname.includes('interested.html');
    const alreadyInterested = Boolean(opp.isInterested);

    // Generate variable fallbacks for hover overlay diversity
    const idx = Math.abs(JSON.stringify(opp).length % 10);
    const hoverPoints = opp.points ? `${opp.points} Points` : `${(idx * 10) + 20} Points`;
    const hoverTime = opp.timeRequired || `${(idx % 3) + 2} Hours`;
    const hoverVenue = opp.location || (idx % 2 === 0 ? "Main Hall" : "Remote / Hybrid");
    const interestButtonLabel = alreadyInterested ? 'Saved' : 'Interested';
    const interestButtonStyle = alreadyInterested
        ? 'style="background: var(--green-500, #10b981); color: white;" aria-pressed="true" disabled'
        : '';

    const matchBadge = opp.hasMatch ? `
        <div class="match-badge ${opp.matchScore >= 70 ? 'high-match' : ''}" style="
            position: absolute;
            top: 12px;
            right: 12px;
            background: ${opp.matchScore >= 70 ? 'var(--green-500, #10b981)' : 'var(--sky-500, #0ea5e9)'};
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 4px;
        ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ${opp.matchScore >= 70 ? 'High Match' : 'Skill Match'} (${opp.matchScore}%)
        </div>
    ` : '';

    return `
        <article class="initiative-card reveal active ${animDelayClass}" ${delayStyle} data-opp-id="${oppId}">
            ${matchBadge}
            <a href="${opp.link}" class="card-link" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; height:100%;">
                <div class="card-image" aria-hidden="true" style="background: ${opp.bgGradient};">
                    <div class="card-icon-overlay" style="color: ${opp.iconColor};">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${opp.mainIcon}
                        </svg>
                    </div>
                </div>
                <div class="card-content" style="padding-bottom: 70px;"> <!-- Add bottom padding to prevent overlap with actions -->
                    <h3>${opp.title}</h3>
                    <p>${opp.description}</p>
                    <span class="tag">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${opp.tagIcon}
                        </svg>
                        ${opp.dateStr}
                    </span>
                    <span class="tag" style="margin-top: 8px; background:var(--white); border-color:var(--sky-200); color:var(--ink-700);">
                        ${opp.category}
                    </span>
                </div>
            </a>
            <div class="card-actions">
                ${onInterestedPage
                    ? `<button class="remove-btn" data-id="${oppId}" style="width: 100%;">Remove Interest</button>`
                    : `<button class="interest-btn" data-id="${oppId}" ${interestButtonStyle}>${interestButtonLabel}</button>`
                }
            </div>
            <div class="card-hover-overlay">
                <h4 class="hover-title">Opportunity Details</h4>
                <p class="hover-description">${opp.description}</p>
                <div class="hover-details">
                    <span>📅 ${opp.dateStr}</span>
                    <span>📍 ${hoverVenue}</span>
                    <span>⏱ ${hoverTime}</span>
                    <span>⭐ ${hoverPoints}</span>
                </div>
            </div>
        </article>
    `;
};
