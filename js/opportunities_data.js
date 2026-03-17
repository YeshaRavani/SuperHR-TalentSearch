// Unified Data Source for SuperHR-TalentSearch Opportunities
// This feeds events.html, initiatives.html, workshops.html, and opportunities.html

window.superHrOpportunities = [
    // ----------------- EVENTS -----------------
    {
        id: "founders-day",
        category: "Event",
        title: "Founders Day Celebration",
        description: "Celebrate campus innovators through storytelling sessions, demos, and networking.",
        dateStr: "Tue, 5:00 PM – 7:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
        link: "event-detail.html?id=founders-day",
        points: "40",
        timeRequired: "2.5 hours",
        location: "Innovation Atrium, Main Academic Block",
        skills: ["Networking", "Communication", "Storytelling", "Innovation Thinking", "Collaboration"],
        expectations: "Participants are expected to engage with speakers, explore contributor and faculty innovation demos, and interact with fellow attendees. Contributors should actively network, ask questions during storytelling sessions, and participate in discussions about new ideas and campus initiatives."
    },
    {
        id: "foundation-day",
        category: "Event",
        title: "Foundation Day Gathering",
        description: "Join faculty, contributors, and alumni for a day of milestones and collaborative energy.",
        dateStr: "Thu, 4:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fefce8, #fef08a)",
        iconColor: "#eab308",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
        link: "event-detail.html?id=foundation-day",
        points: "35",
        timeRequired: "2.5 hours",
        location: "Central Lawn, Main Stage",
        skills: ["Community Building", "Event Etiquette", "Volunteer Support"],
        expectations: "Assist with on-site coordination, support speakers, and help manage attendee flow."
    },
    {
        id: "talent-showcase",
        category: "Event",
        title: "Talent Showcase Evening",
        description: "Watch short presentations from peers working on exciting initiatives and prototypes.",
        dateStr: "Wed, 6:15 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
        iconColor: "#22c55e",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
        link: "event-detail.html?id=talent-showcase",
        points: "30",
        timeRequired: "1.5 hours",
        location: "Studio Theater, Block B",
        skills: ["Active Listening", "Feedback", "Presentation Review"],
        expectations: "Watch all demos, provide constructive feedback, and join the Q&A."
    },
    {
        id: "career-connect",
        category: "Event",
        title: "Career Connect Mixer",
        description: "Meet mentors, recruiters, and project leads in a relaxed conversation-based format.",
        dateStr: "Mon, 3:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
        iconColor: "#ec4899",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
        link: "event-detail.html?id=career-connect",
        points: "25",
        timeRequired: "2 hours",
        location: "Atrium Cafe, North Wing",
        skills: ["Professional Introductions", "Networking", "Follow-up"],
        expectations: "Prepare a 30-second intro and connect with at least three peers."
    },
    {
        id: "pitch-night",
        category: "Event",
        title: "Innovation Pitch Night",
        description: "Present ideas in quick rounds and receive feedback from peers and invited guests.",
        dateStr: "Fri, 7:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #faf5ff, #e9d5ff)",
        iconColor: "#a855f7",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
        link: "event-detail.html?id=pitch-night",
        points: "45",
        timeRequired: "2 hours",
        location: "Startup Hub, Room 204",
        skills: ["Pitching", "Storyboarding", "Q&A"],
        expectations: "Deliver a concise pitch and engage with feedback during Q&A."
    },
    {
        id: "impact-day",
        category: "Event",
        title: "Community Impact Day",
        description: "Participate in service and outreach activities co-created by contributor-led groups.",
        dateStr: "Sat, 11:30 AM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
        link: "event-detail.html?id=impact-day",
        points: "50",
        timeRequired: "3 hours",
        location: "Community Center, South Gate",
        skills: ["Teamwork", "Volunteering", "Field Coordination"],
        expectations: "Participate in assigned outreach tasks and coordinate with team leads on-site."
    },

    // ----------------- INITIATIVES -----------------
    {
        id: "init-1",
        category: "Initiative",
        title: "Campus Sustainability Sprint",
        description: "Collaborate to prototype and launch small sustainability wins across campus spaces.",
        dateStr: "Tue, 4:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, var(--sky-100), var(--sky-200))",
        iconColor: "var(--sky-600)",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=init-1",
        points: "40",
        timeRequired: "4 hours/week",
        location: "Green Lab, Block C",
        skills: ["Sustainability", "Prototyping", "Team Collaboration"],
        expectations: "Commit to weekly sprints and contribute to building functional prototypes for campus use."
    },
    {
        id: "init-2",
        category: "Initiative",
        title: "Community Mentor Circle",
        description: "Join peer-to-peer mentor sessions to share expertise and support new contributors.",
        dateStr: "Thu, 6:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
        iconColor: "#22c55e",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=init-2",
        points: "30",
        timeRequired: "1.5 hours/week",
        location: "Contributor Lounge",
        skills: ["Mentorship", "Empathy", "Guidance"],
        expectations: "Host open sessions for new contributors, offering constructive advice and support."
    },
    {
        id: "init-3",
        category: "Initiative",
        title: "Skills Exchange Lab",
        description: "Short weekly sessions where members teach one practical skill to the cohort.",
        dateStr: "Wed, 5:15 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fefce8, #fef08a)",
        iconColor: "#eab308",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=init-3",
        points: "25",
        timeRequired: "1 hour/week",
        location: "Workshop Room 3",
        skills: ["Teaching", "Skill Sharing", "Peer Review"],
        expectations: "Prepare a mini-lesson on a skill you excel in and present it to small groups."
    },
    {
        id: "init-4",
        category: "Initiative",
        title: "Innovation Partner Program",
        description: "Work on problem statements from internal teams and present rapid concept demos.",
        dateStr: "Mon, 3:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
        iconColor: "#ec4899",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=init-4",
        points: "50",
        timeRequired: "3 hours/week",
        location: "Innovation Hub",
        skills: ["Problem Solving", "Rapid Prototyping", "Client Presentation"],
        expectations: "Collaborate closely with internal stakeholders to solve real-world challenges."
    },
    {
        id: "init-5",
        category: "Initiative",
        title: "Event Experience Squad",
        description: "Shape upcoming events with stronger guest journeys and better engagement ideas.",
        dateStr: "Fri, 2:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #faf5ff, #e9d5ff)",
        iconColor: "#a855f7",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=init-5",
        points: "35",
        timeRequired: "2 hours/event",
        location: "Virtual/Remote",
        skills: ["Event Design", "Guest Experience", "Logistics"],
        expectations: "Help brainstorm and execute creative ideas to enhance visitor experiences at major events."
    },
    {
        id: "init-6",
        category: "Initiative",
        title: "Digital Storytelling Team",
        description: "Create short-form stories that spotlight talent and ongoing opportunity tracks.",
        dateStr: "Sat, 11:00 AM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=init-6",
        points: "45",
        timeRequired: "2.5 hours/week",
        location: "Media Lab, Room 101",
        skills: ["Content Creation", "Video Editing", "Copywriting"],
        expectations: "Produce at least one piece of engaging digital content bi-weekly highlighting campus talent."
    },

    // ----------------- WORKSHOPS -----------------
    {
        id: "work-1",
        category: "Workshop",
        title: "Design Thinking Fundamentals",
        description: "Build user-first problem-solving skills with guided exercises and team critique.",
        dateStr: "Tue, 3:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, var(--sky-100), var(--sky-200))",
        iconColor: "var(--sky-600)",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "workshop-detail.html?id=work-1",
        points: "25",
        timeRequired: "1.5 hours",
        location: "Design Studio A",
        skills: ["Design Thinking", "Empathy Mapping", "Ideation"],
        expectations: "Actively participate in small group activities and present a rough concept by the end of the session."
    },
    {
        id: "work-2",
        category: "Workshop",
        title: "Public Speaking Lab",
        description: "Practice storytelling and speaking confidence with live feedback in a small group format.",
        dateStr: "Thu, 5:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`,
        link: "workshop-detail.html?id=work-2",
        points: "30",
        timeRequired: "2 hours",
        location: "Auditorium C",
        skills: ["Public Speaking", "Communication", "Confidence"],
        expectations: "Prepare a short 1-minute piece to deliver, and provide constructive critiques to peers."
    },
    {
        id: "work-3",
        category: "Workshop",
        title: "Data Skills Bootcamp",
        description: "Learn data cleaning, dashboards, and quick analysis techniques for real campus use cases.",
        dateStr: "Wed, 6:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fefce8, #fef08a)",
        iconColor: "#eab308",
        mainIcon: `<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>`,
        link: "workshop-detail.html?id=work-3",
        points: "40",
        timeRequired: "3 hours",
        location: "Computer Lab 4",
        skills: ["Data Analysis", "Dashboard UI", "Excel/SQL Basics"],
        expectations: "Bring your laptop and follow along with the guided data sets provided."
    },
    {
        id: "work-4",
        category: "Workshop",
        title: "Project Management 101",
        description: "Master basic frameworks like Agile and Kanban to organize diverse campus activities.",
        dateStr: "Mon, 4:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
        iconColor: "#22c55e",
        mainIcon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>`,
        link: "workshop-detail.html?id=work-4",
        points: "25",
        timeRequired: "1.5 hours",
        location: "Seminar Room 2",
        skills: ["Agile/Scrum", "Organization", "Kanban"],
        expectations: "Engage in the group planning exercise, breaking down a large project into actionable sprints."
    },
    {
        id: "work-5",
        category: "Workshop",
        title: "Digital Marketing Basics",
        description: "Discover tools to improve visibility for contributor organizations and personal portfolios.",
        dateStr: "Fri, 3:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
        iconColor: "#ec4899",
        mainIcon: `<circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>`,
        link: "workshop-detail.html?id=work-5",
        points: "30",
        timeRequired: "2 hours",
        location: "Virtual Classroom",
        skills: ["SEO", "Social Media Strategy", "Copywriting"],
        expectations: "Complete the post-workshop quiz and draft a mini campaign plan for a contributor club."
    },
    {
        id: "work-6",
        category: "Workshop",
        title: "Creative Writing Studio",
        description: "Engage in prompts to draft compelling articles, statements, or creative essays.",
        dateStr: "Sat, 1:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #faf5ff, #e9d5ff)",
        iconColor: "#a855f7",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "workshop-detail.html?id=work-6",
        points: "35",
        timeRequired: "2.5 hours",
        location: "Library Reading Room",
        skills: ["Creative Writing", "Editing", "Expression"],
        expectations: "Be open to sharing raw drafts and offering kind, constructive feedback to your peers."
    }
];

// Helper method to generate the HTML string for a single card based on the defined data format
window.generateOpportunityCardHTML = function (opp, indexDelay = 0, inInterestedSection = false) {
    const delayStyle = indexDelay > 0 ? `style="transition-delay: ${indexDelay * 0.1}s;"` : '';
    const animDelayClass = indexDelay > 0 ? `delay-${indexDelay}` : '';
    const oppId = opp.id || opp.title;

    return `
        <article class="initiative-card reveal ${animDelayClass}" ${delayStyle} data-opp-id="${oppId}">
            <a href="${opp.link}" class="card-link" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; height:100%;">
                <div class="card-image" aria-hidden="true" style="background: ${opp.bgGradient};">
                    <div class="card-icon-overlay" style="color: ${opp.iconColor};">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${opp.mainIcon}
                        </svg>
                    </div>
                </div>
                <div class="card-content">
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
            <div class="card-hover-actions">
                ${inInterestedSection ? `
                <button class="btn-not-interested" data-id="${oppId}" aria-label="Remove from interested">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;">
                        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Not Interested
                </button>
                ` : `
                <button class="btn-interested" data-id="${oppId}" aria-label="Mark as interested in ${opp.title}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
                    </svg>
                    Interested
                </button>
                <button class="btn-not-interested" data-id="${oppId}" aria-label="Mark as not interested">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;">
                        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Not Interested
                </button>
                `}
            </div>
        </article>
    `;
};

