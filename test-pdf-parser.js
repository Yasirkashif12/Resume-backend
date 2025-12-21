const pdfParser = require('pdf-parser');

console.log('--- pdf-parser ---');
console.log('Keys:', Object.keys(pdfParser));

async function test() {
  const buffer = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
  );
  try {
    // pdf-parser usually has a different API
    // Looking at keys: [ 'pdf2json' ]
    if (typeof pdfParser.pdf2json === 'function') {
      console.log('Trying pdfParser.pdf2json(buffer)...');
      const res = await pdfParser.pdf2json(buffer);
      console.log('Result:', res);
    }
  } catch (e) {
    console.log('Test failed:', e.message);
  }
}

test();
