// Minimal Axe run using Playwright + local axe-core (CJS)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const target = process.env.AUDIT_URL || 'http://localhost:5173/';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(target);
  await page.waitForLoadState('networkidle');
  const axePath = require.resolve('axe-core/axe.min.js');
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async () => await axe.run());
  const outPath = path.resolve(process.cwd(), 'axe-report.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Axe report written to ${outPath}`);
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });


