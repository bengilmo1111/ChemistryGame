import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const SCREENSHOT_DIR = 'tests/screenshots-sandbox';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const errors = [];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 });
const page = await context.newPage();

page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 15000 });
const canvas = await page.$('canvas');
await page.waitForTimeout(1200);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/01-menu.png` });

const box = await canvas.boundingBox();
const sx = box.width / 1024;
const sy = box.height / 640;
const toScreen = (gx, gy) => ({ x: box.x + gx * sx, y: box.y + gy * sy });

async function clickGame(gx, gy, label) {
  const p = toScreen(gx, gy);
  await page.mouse.click(p.x, p.y);
  if (label) console.log(`click ${label} at game(${gx},${gy})`);
}

// MenuScene: click MAD MIX (sandbox) at (512, 452)
await clickGame(512, 452, 'MAD MIX sandbox');
await page.waitForTimeout(700);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/02-sandbox-initial.png` });

// Add 3 ingredients
await clickGame(60, 304, 'fizz');
await page.waitForTimeout(200);
await clickGame(160, 304, 'sour');
await page.waitForTimeout(200);
await clickGame(260, 304, 'bubble base');
await page.waitForTimeout(200);

// Seal it for a pop
await clickGame(622, 418, 'seal tool');
await page.waitForTimeout(200);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/03-sandbox-loaded.png` });

// Mix
await clickGame(858, 570, 'Mix!');
await page.waitForTimeout(400);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/04-sandbox-boom.png` });
await page.waitForTimeout(1900);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/05-sandbox-after.png` });

// Try another mix: 2 ingredients no tool — random failure
await clickGame(60, 396, 'purple');
await page.waitForTimeout(200);
await clickGame(160, 396, 'glimmer');
await page.waitForTimeout(200);
await clickGame(858, 570, 'Mix!');
await page.waitForTimeout(500);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/06-second-boom.png` });
await page.waitForTimeout(1800);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/07-second-after.png` });

// Back to menu — should show score now
await clickGame(92, 44, 'menu');
await page.waitForTimeout(700);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/08-menu-with-score.png` });

// Now play a real card and verify BOOM splash + score works there too
await clickGame(512, 388, 'Play as Henry');
await page.waitForTimeout(500);
await clickGame(206, 318, 'foamy fountain');
await page.waitForTimeout(600);
await clickGame(88, 162, 'predict foam');
await page.waitForTimeout(150);
await clickGame(60, 304, 'fizz');
await page.waitForTimeout(150);
await clickGame(160, 304, 'sour');
await page.waitForTimeout(150);
await clickGame(622, 304, 'stir');
await page.waitForTimeout(150);
await clickGame(858, 570, 'Mix!');
await page.waitForTimeout(450);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/09-card-boom.png` });
await page.waitForTimeout(1900);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/10-card-results-with-score.png` });

console.log('--- ERRORS ---');
errors.forEach((e) => console.log(e));

await browser.close();

if (errors.length > 0) {
  console.error(`Sandbox playtest finished with ${errors.length} errors.`);
  process.exit(1);
}
console.log('Sandbox playtest finished.');
