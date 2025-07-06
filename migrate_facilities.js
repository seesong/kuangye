// Script to migrate fire/overnight boolean fields into facilities array.
// Creates a backup campsites_backup.json before modifying.
const fs = require('fs');
const path = './campsites.json';
const backup = './campsites_backup.json';

const raw = fs.readFileSync(path, 'utf-8');
const data = JSON.parse(raw);

// Backup original file
fs.writeFileSync(backup, JSON.stringify(data, null, 2));

const migrated = data.map((camp) => {
  // Facilities list or empty array
  const fac = Array.isArray(camp.facilities) ? camp.facilities.filter(Boolean) : [];
  const prefix = [];
  if (camp.fire) prefix.push('fire');
  if (camp.overnight) prefix.push('overnight');

  // ensure no duplicates
  const combined = [...new Set([...prefix, ...fac.filter((f) => f !== 'fire' && f !== 'overnight')])];

  const { fire, overnight, ...rest } = camp;
  return { ...rest, facilities: combined };
});

fs.writeFileSync(path, JSON.stringify(migrated, null, 2));
console.log('Migration complete. Backup saved as', backup);
