import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const SCREENSHOT_DIR = 'tests/screenshots/failure';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 });
const page = await context.newPage();
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
const canvas = await page.$('canvas');
await page.waitForTimeout(1500);
const box = await canvas.boundingBox();
const sx = box.width / 1024;
const sy = box.height / 640;
const click = async (gx, gy) => page.mouse.click(box.x + gx * sx, box.y + gy * sy);

// Menu → Cards → Foamy Fountain
await click(512, 398); await page.waitForTimeout(500);
await click(206, 318); await page.waitForTimeout(700);

// Pick wrong prediction
await click(296, 162); // "Crystals grow"
await page.waitForTimeout(150);

// Add wrong ingredients (purple-potion at (60,396) and glimmer-salt at (160,396))
await click(60, 396); await page.waitForTimeout(200);
await click(160, 396); await page.waitForTimeout(200);

// Use the wrong tool (Cool)
await click(622, 380); await page.waitForTimeout(200);

await canvas.screenshot({ path: `${SCREENSHOT_DIR}/01-wrong-mix-ready.png` });

// Mix!
await click(858, 570);
await page.waitForTimeout(2700);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/02-failure-result.png` });

// Also try missing-tool failure: Foamy Fountain with right ingredients but no Stir
await click(384, 588); // Replay
await page.waitForTimeout(700);
await click(88, 162); // predict Foam
await click(60, 304); await page.waitForTimeout(200); // fizz-powder
await click(160, 304); await page.waitForTimeout(200); // sour-drops
// Skip the stir tool
await click(858, 570); // Mix
await page.waitForTimeout(2700);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/03-missing-tool-result.png` });

await browser.close();
if (errors.length) {
  errors.forEach((e) => console.error(e));
  process.exit(1);
}
console.log('Failure-path playtest finished cleanly.');
