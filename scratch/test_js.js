const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const html = fs.readFileSync("opportunities.html", "utf8");
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
dom.window.document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
});
setTimeout(() => {
    console.log("Errors:", dom.window._errors || "none");
}, 2000);
