const pdf = require('pdf-parse');

console.log('--- pdf-parse (v2.x) ---');
console.log('pdf.PDFParse:', pdf.PDFParse);

async function test() {
  const buffer = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
  );
  try {
    console.log(
      'PDFParse prototype keys:',
      Object.keys(pdf.PDFParse.prototype),
    );
    console.log('PDFParse static keys:', Object.keys(pdf.PDFParse));

    // Let's try to instantiate it
    const instance = new pdf.PDFParse();
    console.log('Instance keys:', Object.keys(instance));

    // Many modern parsers use .parse()
    if (typeof instance.parse === 'function') {
      console.log('Trying instance.parse(buffer)...');
      const res = await instance.parse(buffer);
      console.log('Result:', res);
    } else if (typeof pdf.PDFParse.parse === 'function') {
      console.log('Trying PDFParse.parse(buffer)...');
      const res = await pdf.PDFParse.parse(buffer);
      console.log('Result:', res);
    }
  } catch (e) {
    console.log('Test failed:', e.message);
    console.log(e.stack);
  }
}

test();
