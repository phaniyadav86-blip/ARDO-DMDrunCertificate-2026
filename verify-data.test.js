const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('assets/verification-data.js', 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const values = [...sandbox.window.ARDO_VERIFICATION_HASHES];
if (values.length !== 582) throw new Error(`Expected 582 records, found ${values.length}`);
if (!values.every(v => /^[a-f0-9]{64}$/.test(v))) throw new Error('Malformed SHA-256 value');
console.log('Verification data tests passed.');
