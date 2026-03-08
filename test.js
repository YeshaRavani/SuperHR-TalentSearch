const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`
          <div style="position: relative;">
            <button class="icon-btn" id="notifToggle">
              <span class="icon-dot"></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <div class="notif-dropdown" id="notifDropdown">
              <div class="notif-item">
                <button class="btn btn-sky">Post Opportunity</button>
              </div>
            </div>
          </div>
`);
const btn = dom.window.document.getElementById("notifToggle");
console.log("TEXT: '" + btn.textContent.trim().toLowerCase() + "'");
console.log("INCLUDES: " + btn.textContent.includes('Post Opportunity'));
