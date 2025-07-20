const fs = require('fs');
const path = require('path');

const versionPath = path.join(__dirname, '../public/version.json');

if (!fs.existsSync(versionPath)) {
  console.error('version.json not found!');
  process.exit(1);
}

const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const current = parseInt(versionData.version, 10) || 0;
const next = current + 1;
versionData.version = String(next);
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n');
console.log(`Version updated: ${current} → ${next}`);
