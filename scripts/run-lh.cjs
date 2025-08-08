// Minimal Lighthouse CI via chrome-launcher + lighthouse (CJS)
const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

(async () => {
  const target = process.env.AUDIT_URL || 'http://localhost:5173/';
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const opts = { logLevel: 'info', output: 'json', port: chrome.port };
  const runnerResult = await lighthouse(target, opts);
  const outPath = path.resolve(process.cwd(), 'lighthouse-report.json');
  fs.writeFileSync(outPath, runnerResult.report);
  console.log(`Lighthouse report written to ${outPath}`);
  await chrome.kill();
})().catch(err => { console.error(err); process.exit(1); });


