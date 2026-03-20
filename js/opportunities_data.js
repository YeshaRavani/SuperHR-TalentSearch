// Unified Data Source for SuperHR-TalentSearch Opportunities
// This feeds the opportunity detail and listing pages.

window.superHrOpportunities = [
    // ----------------- PYTHON -----------------
    {
        id: "py-automation",
        category: "Initiative",
        title: "Python Automation Project",
        description: "Work on automating internal workflows using Python scripts and improve operational efficiency. Create cron jobs, fetch reports via API integrations, and reduce manual entry hours significantly.",
        dateStr: "Mon, 10:00 AM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=py-automation",
        skills: ["Python", "Automation", "Workflow Optimization"],
        points: "50",
        timeRequired: "4–6 hours/week",
        location: "Hybrid / Remote",
        expectations: [
            "Write clean, efficient Python scripts",
            "Collaborate with team members on workflow improvements",
            "Participate in weekly progress check-ins",
            "Document processes and automation logic"
        ],
        responsibilities: [
            "Build automation scripts for repetitive tasks",
            "Integrate APIs for data retrieval",
            "Optimize internal workflows",
            "Debug and maintain existing scripts"
        ],
        benefits: [
            "Hands-on experience with real-world automation",
            "Exposure to API integrations and backend workflows",
            "Opportunity to collaborate with cross-functional teams",
            "Certificate / recognition upon completion"
        ],
        prerequisites: [
            "Basic knowledge of Python",
            "Understanding of APIs (REST)",
            "Familiarity with scripting or automation tools",
            "Problem-solving mindset"
        ],
        appliedCount: 12
    },
    {
        id: "py-api",
        category: "Initiative",
        title: "Backend API Development",
        description: "Assist in building scalable backend services utilizing modern Python frameworks. Outline endpoints, setup databases access layer efficiently.",
        dateStr: "Wed, 2:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
        iconColor: "#22c55e",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=py-api",
        skills: ["Python", "APIs", "Backend"]
    },
    {
        id: "py-data",
        category: "Workshop",
        title: "Data Processing Task",
        description: "Analyze and process datasets for insights. Conduct cleaning sprints with Panda libraries to optimize sheet reads securely.",
        dateStr: "Fri, 4:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fefce8, #fef08a)",
        iconColor: "#eab308",
        mainIcon: `<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>`,
        link: "workshop-detail.html?id=py-data",
        skills: ["Python", "Data Analysis", "Pandas"]
    },

    // ----------------- AI -----------------
    {
        id: "ai-chatbot",
        category: "Initiative",
        title: "AI Chatbot Development",
        description: "Collaborate on building an intelligent chatbot to enhance user engagement and automate support. Implement NLP libraries to parse queries and train robust response paths iteratively.",
        dateStr: "Tue, 11:30 AM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
        iconColor: "#ec4899",
        mainIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        link: "initiative-detail.html?id=ai-chatbot",
        skills: ["AI", "NLP", "Machine Learning"]
    },
    {
        id: "ai-model",
        category: "Initiative",
        title: "ML Model Training",
        description: "Train machine learning models on internal datasets to improve prediction scores.",
        dateStr: "Thu, 3:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #faf5ff, #e9d5ff)",
        iconColor: "#a855f7",
        mainIcon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>`,
        link: "initiative-detail.html?id=ai-model",
        skills: ["AI", "ML", "Data Science"]
    },
    {
        id: "ai-research",
        category: "Workshop",
        title: "AI Research Task",
        description: "Explore emerging AI trends and tools and present a brief findings assessment.",
        dateStr: "Sat, 1:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`,
        link: "workshop-detail.html?id=ai-research",
        skills: ["AI", "Research", "Tech Trends"]
    },

    // ----------------- VIDEO EDITING -----------------
    {
        id: "vid-highlight",
        category: "Initiative",
        title: "Event Highlight Video Creation",
        description: "Edit and produce engaging highlight videos for major events and campaigns. Splice clips, sync with audio tracks, scale typography, and publish short promotional montages for channels.",
        dateStr: "Wed, 10:00 AM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
        iconColor: "#ec4899",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=vid-highlight",
        skills: ["Video Editing", "Content Creation", "Premiere Pro"]
    },
    {
        id: "vid-clips",
        category: "Initiative",
        title: "Social Media Clips",
        description: "Create short-form content for social platforms to drive engagement and clicks.",
        dateStr: "Fri, 12:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
        iconColor: "#22c55e",
        mainIcon: `<circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>`,
        link: "initiative-detail.html?id=vid-clips",
        skills: ["Video Editing", "Social Media", "Shorts"]
    },
    {
        id: "vid-promo",
        category: "Workshop",
        title: "Promotional Video Editing",
        description: "Assist in editing marketing videos adhering to brand guidelines efficiently.",
        dateStr: "Mon, 4:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fefce8, #fef08a)",
        iconColor: "#eab308",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "workshop-detail.html?id=vid-promo",
        skills: ["Video Editing", "Marketing", "Splicing"]
    },

    // ----------------- PHOTOGRAPHY -----------------
    {
        id: "photo-coverage",
        category: "Event",
        title: "Event Photography Coverage",
        description: "Capture high-quality images during events and workshops to document key moments. Setup lighting, interact with attendees politely, and submit graded edits post activities speedswards.",
        dateStr: "Sat, 2:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line>`,
        link: "event-detail.html?id=photo-coverage",
        skills: ["Photography", "Event Coverage", "Lighting"]
    },
    {
        id: "photo-portrait",
        category: "Event",
        title: "Portrait Photography",
        description: "Take professional headshots for contributors and leads on scheduled hours.",
        dateStr: "Tue, 4:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fefce8, #fef08a)",
        iconColor: "#eab308",
        mainIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        link: "event-detail.html?id=photo-portrait",
        skills: ["Photography", "Portraits", "Headshots"]
    },
    {
        id: "photo-product",
        category: "Workshop",
        title: "Product Photography",
        description: "Assist in shooting product visuals and organizing accessory sets correctly.",
        dateStr: "Thu, 10:00 AM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
        iconColor: "#22c55e",
        mainIcon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>`,
        link: "workshop-detail.html?id=photo-product",
        skills: ["Photography", "Product Shoot", "Composition"]
    },

    // ----------------- PERFORMANCE -----------------
    {
        id: "perf-showcase",
        category: "Event",
        title: "Talent Showcase Performance",
        description: "Participate in live performances to showcase your skills in front of a wider audience. Coordinate sets, engage crowds with dynamic formats, and leave memorable feedback loops onwards securely.",
        dateStr: "Fri, 7:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #faf5ff, #e9d5ff)",
        iconColor: "#a855f7",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line>`,
        link: "event-detail.html?id=perf-showcase",
        skills: ["Performance", "Stage Presence", "Public Engagement"]
    },
    {
        id: "perf-workshop",
        category: "Workshop",
        title: "Workshop Participation",
        description: "Engage in performance-based workshops improving speech and bodily stances.",
        dateStr: "Mon, 5:30 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`,
        link: "workshop-detail.html?id=perf-workshop",
        skills: ["Performance", "Workshop", "Stance"]
    },
    {
        id: "perf-coordination",
        category: "Event",
        title: "Stage Event Coordination",
        description: "Assist in organizing performances managing backstages and queues reliably.",
        dateStr: "Sat, 6:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
        iconColor: "#ec4899",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="2" x2="8" y2="6"></line>`,
        link: "event-detail.html?id=perf-coordination",
        skills: ["Performance", "Coordination", "Logistics"]
    },
    // ----------------- CURATED / INTERESTED -----------------
    {
        id: "curated-startup",
        category: "Initiative",
        title: "Startup Pitch Collaboration",
        description: "Work with a team to build and pitch a startup idea. Develop prototypes, layout business models, and present to judges and advisors.",
        dateStr: "Mon, 6:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #eff6ff, #bfdbfe)",
        iconColor: "#3b82f6",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "initiative-detail.html?id=curated-startup",
        skills: ["Interested", "Entrepreneurship", "Pitching"]
    },
    {
        id: "curated-uiux",
        category: "Workshop",
        title: "UI/UX Redesign Sprint",
        description: "Redesign internal tools for better usability. Conduct user research, wireframe ideal paths, and improve system navigation.",
        dateStr: "Wed, 3:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #f0fdf4, #bbf7d0)",
        iconColor: "#22c55e",
        mainIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
        link: "workshop-detail.html?id=curated-uiux",
        skills: ["Interested", "Design", "UI/UX"]
    },
    {
        id: "curated-content",
        category: "Initiative",
        title: "Content Creation Campaign",
        description: "Create engaging content for social media initiatives. Shoot promos, edit shorts, and manage calendar drops securely.",
        dateStr: "Thu, 4:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fefce8, #fef08a)",
        iconColor: "#eab308",
        mainIcon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>`,
        link: "initiative-detail.html?id=curated-content",
        skills: ["Interested", "Content", "Marketing"]
    },
    {
        id: "curated-event",
        category: "Event",
        title: "Community Event Organizer",
        description: "Plan and execute community engagement events. Outline run sheets, manage logistics, and ensure attendee satisfaction.",
        dateStr: "Sat, 2:00 PM",
        tagIcon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        bgGradient: "linear-gradient(140deg, #fdf4ff, #fbcfe8)",
        iconColor: "#ec4899",
        mainIcon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="2" x2="8" y2="6"></line>`,
        link: "event-detail.html?id=curated-event",
        skills: ["Interested", "Management", "Logistics"]
    }
];

// Helper method to generate the HTML string for a single card based on the defined data format
window.generateOpportunityCardHTML = function (opp, indexDelay = 0, inInterestedSection = false, isInterestedPage = false) {
    const delayStyle = indexDelay > 0 ? `style="transition-delay: ${indexDelay * 0.1}s;"` : '';
    const animDelayClass = indexDelay > 0 ? `delay-${indexDelay}` : '';
    const oppId = opp.id || opp.title;

    // Generate variable fallbacks for hover overlay diversity
    const idx = Math.abs(JSON.stringify(opp).length % 10);
    const hoverPoints = opp.points ? `${opp.points} Points` : `${(idx * 10) + 20} Points`;
    const hoverTime = opp.timeRequired || `${(idx % 3) + 2} Hours`;
    const hoverVenue = opp.location || (idx % 2 === 0 ? "Main Hall" : "Remote / Hybrid");

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
                <button class="interest-btn" data-id="${oppId}">Interested</button>
                <button class="remove-btn" data-id="${oppId}">Remove</button>
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
