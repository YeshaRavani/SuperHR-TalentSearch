const fs = require('fs');
const js = fs.readFileSync('js/community.js', 'utf8');
console.log(js.includes('memberList.addEventListener'));
