const bsv = require('@bsv/sdk');
console.log('Keys:', Object.keys(bsv));
if (bsv.Utils) console.log('Utils:', Object.keys(bsv.Utils));
if (bsv.Script) console.log('Script:', Object.keys(bsv.Script));
if (bsv.Hash) console.log('Hash:', Object.keys(bsv.Hash));
