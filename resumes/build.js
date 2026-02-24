#!/usr/bin/env node
/**
 * Resume builder — converts all src/*.html files to pdf/*.pdf
 * Usage: node resumes/build.js [optional: src/version.html]
 */

const puppeteer = require('/tmp/pdf-gen/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const SRC_DIR = path.join(__dirname, 'src');
const PDF_DIR = path.join(__dirname, 'pdf');

if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

async function buildResume(htmlFile) {
  const name = path.basename(htmlFile, '.html');
  const outPath = path.join(PDF_DIR, `JohnClementeResume-${name}.pdf`);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  await browser.close();
  console.log(`✓ ${path.basename(outPath)}`);
  return outPath;
}

(async () => {
  const target = process.argv[2];
  const files = target
    ? [path.resolve(target)]
    : fs.readdirSync(SRC_DIR)
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(SRC_DIR, f));

  console.log(`Building ${files.length} resume(s)...\n`);
  for (const f of files) await buildResume(f);
  console.log('\nDone.');
})();
