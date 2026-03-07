(function () {
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  var events = [
    {
      key: "founders-day",
      title: "Founders Day Celebration",
      description: "Celebrate campus innovators through storytelling sessions, demos, and networking.",
      schedule: "Tue, 5:00 PM",
      points: "40",
      timeRequired: "2 hours",
    },
    {
      key: "foundation-day",
      title: "Foundation Day Gathering",
      description: "Join faculty, students, and alumni for a day of milestones and collaborative energy.",
      schedule: "Thu, 4:30 PM",
      points: "35",
      timeRequired: "2.5 hours",
    },
    {
      key: "talent-showcase",
      title: "Talent Showcase Evening",
      description: "Watch short presentations from peers working on exciting initiatives and prototypes.",
      schedule: "Wed, 6:15 PM",
      points: "30",
      timeRequired: "1.5 hours",
    },
    {
      key: "career-connect",
      title: "Career Connect Mixer",
      description: "Meet mentors, recruiters, and project leads in a relaxed conversation-based format.",
      schedule: "Mon, 3:30 PM",
      points: "25",
      timeRequired: "2 hours",
    },
    {
      key: "pitch-night",
      title: "Innovation Pitch Night",
      description: "Present ideas in quick rounds and receive feedback from peers and invited guests.",
      schedule: "Fri, 7:00 PM",
      points: "45",
      timeRequired: "2 hours",
    },
    {
      key: "impact-day",
      title: "Community Impact Day",
      description: "Participate in service and outreach activities co-created by student-led groups.",
      schedule: "Sat, 11:30 AM",
      points: "50",
      timeRequired: "3 hours",
    },
  ];

  var app = document.getElementById("app");
  if (!app) {
    return;
  }

  var pageWrap = el("div", "page-wrap");

  var header = el("header", "topbar");
  var nav = el("div", "nav");
  var logo = el("div", "logo");
  var logoImg = el("img", "logo-img");
  logoImg.src = "logo.png";
  logoImg.alt = "Talent Search logo";
  logo.appendChild(logoImg);
  logo.appendChild(document.createTextNode("Talent Search"));

  var menu = el("nav", "menu");
  var menuLinks = [
    { label: "Home", href: "index (1).html" },
    { label: "Initiatives", href: "initiatives.html" },
    { label: "Workshops", href: "workshops.html" },
    { label: "Events", href: "events.html", active: true },
    { label: "Posted Opportunities", href: "posted-opportunities.html" },
    { label: "About Us", href: "aboutus.html" },
  ];
  menuLinks.forEach(function (item) {
    var link = el("a", item.active ? "active" : "", item.label);
    link.href = item.href;
    menu.appendChild(link);
  });

  var navActions = el("div", "nav-actions");
  var notificationWrap = el("div", "notification-wrap");
  var toggle = el("button", "icon-btn notification-toggle");
  toggle.setAttribute("aria-label", "Notifications");
  toggle.setAttribute("aria-haspopup", "true");
  toggle.setAttribute("aria-expanded", "false");
  var dot = el("span", "icon-dot");
  toggle.appendChild(dot);
  toggle.appendChild(document.createTextNode("🔔"));

  var panel = el("div", "notification-panel");
  panel.setAttribute("role", "menu");
  panel.setAttribute("aria-label", "Notifications");
  var panelHead = el("h3", "notification-head", "Notifications");
  panel.appendChild(panelHead);

  var item1 = el("div", "notification-item");
  var item1Text = el("p", "", "Interest matched: \"Campus Sustainability Sprint\". Do you want to enroll?");
  var item1Actions = el("div", "notification-actions");
  var enrollBtn = el("button", "notif-btn", "Enroll");
  var laterBtn = el("button", "notif-btn secondary", "Later");
  item1Actions.appendChild(enrollBtn);
  item1Actions.appendChild(laterBtn);
  item1.appendChild(item1Text);
  item1.appendChild(item1Actions);

  var item2 = el("div", "notification-item");
  item2.appendChild(el("p", "", "You have a new workshop recommendation based on your recent activity."));

  var item3 = el("div", "notification-item");
  item3.appendChild(el("p", "", "Reminder: Foundation Day event registration closes tomorrow."));

  panel.appendChild(item1);
  panel.appendChild(item2);
  panel.appendChild(item3);

  notificationWrap.appendChild(toggle);
  notificationWrap.appendChild(panel);

  var profile = el("a", "profile", "👤");
  profile.setAttribute("aria-label", "Profile");
  profile.href = "profile.html";

  navActions.appendChild(notificationWrap);
  navActions.appendChild(profile);

  nav.appendChild(logo);
  nav.appendChild(menu);
  nav.appendChild(navActions);
  header.appendChild(nav);

  var main = el("main", "page");
  var headSection = el("section", "page-head");
  headSection.appendChild(el("h1", "", "Explore Events"));
  var headSub = el(
    "p",
    "head-subtext",
    "Discover community events, showcases, and meetups where you can connect and contribute."
  );
  headSection.appendChild(headSub);
  main.appendChild(headSection);

  var grid = el("section", "initiatives-grid");
  events.forEach(function (eventItem) {
    var card = el("article", "initiative-card");
    var link = el("a", "card-link");
    link.href = "event-detail.html?event=" + eventItem.key;

    var image = el("div", "card-image");
    image.setAttribute("aria-hidden", "true");

    var content = el("div", "card-content");
    var title = el("h3", "", eventItem.title);
    var desc = el("p", "", eventItem.description);

    var meta = el("div", "card-meta");
    meta.appendChild(el("span", "", "Schedule: " + eventItem.schedule));
    meta.appendChild(el("span", "card-points", "Points: " + eventItem.points));
    meta.appendChild(el("span", "", "Time Required: " + eventItem.timeRequired));

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(meta);

    link.appendChild(image);
    link.appendChild(content);
    card.appendChild(link);
    grid.appendChild(card);
  });
  main.appendChild(grid);

  var footer = el("section", "footer-cta");
  footer.appendChild(el("span", "", "No events matched? Contact us"));
  var appointment = el("a", "", "Book an appointment");
  appointment.href = "appointment.html";
  footer.appendChild(appointment);
  main.appendChild(footer);

  pageWrap.appendChild(header);
  pageWrap.appendChild(main);
  app.appendChild(pageWrap);

  document.querySelectorAll(".notification-wrap").forEach(function (wrap) {
    var toggleBtn = wrap.querySelector(".notification-toggle");
    var panelEl = wrap.querySelector(".notification-panel");
    if (!toggleBtn || !panelEl) {
      return;
    }

    toggleBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = panelEl.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    panelEl.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.addEventListener("click", function () {
      panelEl.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        panelEl.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  });

  var cards = document.querySelectorAll(".initiative-card");
  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      card.classList.add("is-expanded");
    });
    card.addEventListener("mouseleave", function () {
      card.classList.remove("is-expanded");
    });
  });
})();
