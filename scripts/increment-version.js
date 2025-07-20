const fs = require('fs');
const path = require('path');

console.log('Script starting...');

const versionPath = path.join(__dirname, '../public/version.json');
console.log('Version path:', versionPath);

if (!fs.existsSync(versionPath)) {
  console.error('version.json not found!');
  process.exit(1);
}

const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
console.log('Current version data:', versionData);

const current = parseInt(versionData.version, 10) || 0;
console.log('Current version:', current);

const next = current + 1;
console.log('Next version:', next);

versionData.version = String(next);
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n');
console.log(`Version updated: ${current} → ${next}`);
