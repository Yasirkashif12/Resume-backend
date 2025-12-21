const pdfParse = require('pdf-parse');
const pdfParser = require('pdf-parser');

console.log('--- pdf-parse ---');
console.log('Type:', typeof pdfParse);
console.log('Keys:', Object.keys(pdfParse));

console.log('--- pdf-parser ---');
console.log('Type:', typeof pdfParser);
console.log('Keys:', Object.keys(pdfParser));

const buffer = Buffer.from('%PDF-1.4');
try {
  console.log('Trying pdf-parse(buffer)...');
  pdfParse(buffer)
    .then(() => console.log('pdf-parse success'))
    .catch((err) => console.log('pdf-parse err:', err.message));
} catch (e) {
  console.log('pdf-parse direct call failed:', e.message);
}
