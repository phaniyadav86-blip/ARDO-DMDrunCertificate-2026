const fs = require('fs');
const crypto = require('crypto');

const input = process.argv[2] || '../upload/ARDO Duchenne MD Awareness Run 2026(1).csv';
const output = process.argv[3] || 'assets/verification-data.js';

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}

const normalizeTicket = value => String(value || '').replace(/\s+/g, '').toUpperCase();
const normalizePhone = value => String(value || '').replace(/\D/g, '').slice(-10);
const data = fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, '');
const rows = parseCsv(data);
const headers = rows.shift();
const ticketIndex = headers.indexOf('Ticket ID');
const phoneIndex = headers.indexOf('Primary Phone');
if (ticketIndex < 0 || phoneIndex < 0) throw new Error('Required columns not found.');

const hashes = rows.filter(row => row.some(Boolean)).map(row => {
  const ticket = normalizeTicket(row[ticketIndex]);
  const phone = normalizePhone(row[phoneIndex]);
  if (!ticket || phone.length !== 10) throw new Error('Invalid participant record.');
  return crypto.createHash('sha256').update(`${ticket}|${phone}`).digest('hex');
});
if (new Set(hashes).size !== hashes.length) throw new Error('Duplicate verification pair found.');
fs.mkdirSync(require('path').dirname(output), { recursive: true });
fs.writeFileSync(output, `window.ARDO_VERIFICATION_HASHES = new Set(${JSON.stringify(hashes)});\n`);
console.log(`Generated ${hashes.length} privacy-safe verification records.`);
