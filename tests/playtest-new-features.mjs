import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const SCREENSHOT_DIR = 'tests/screenshots-new-features';
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
await page.waitForTimeout(1400);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/01-menu.png` });

const box = await canvas.boundingBox();
const sx = box.width / 1024;
const sy = box.height / 640;

async function clickGame(gx, gy, label) {
  await page.mouse.click(box.x + gx * sx, box.y + gy * sy);
  if (label) console.log(`click ${label} at game(${gx},${gy})`);
}

// Sandbox: discover the glow-lava secret (fizz powder + goo gel + warm)
await clickGame(512, 452, 'MAD MIX sandbox');
await page.waitForTimeout(700);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/02-sandbox.png` });

await clickGame(666, 512, 'recipe book');
await page.waitForTimeout(400);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/03-recipe-book-empty.png` });
await clickGame(512, 532, 'close recipe book');
await page.waitForTimeout(300);

await clickGame(60, 304, 'fizz powder');
await page.waitForTimeout(250);
await clickGame(260, 396, 'goo gel');
await page.waitForTimeout(250);
await clickGame(622, 342, 'warm tool');
await page.waitForTimeout(250);
await clickGame(858, 570, 'Mix!');
await page.waitForTimeout(1100);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/04-secret-discovered.png` });
await page.waitForTimeout(1700);

await clickGame(666, 512, 'recipe book again');
await page.waitForTimeout(400);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/05-recipe-book-found.png` });
await clickGame(512, 532, 'close recipe book');
await page.waitForTimeout(300);

// Back to menu, then level select (stars row should render)
await clickGame(92, 44, 'menu');
await page.waitForTimeout(600);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/06-menu-after-secret.png` });
await clickGame(512, 388, 'play');
await page.waitForTimeout(600);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/07-level-select.png` });

// Foamy Fountain with a matching prediction → 2 stars
await clickGame(206, 318, 'foamy fountain card');
await page.waitForTimeout(700);
await clickGame(88, 162, 'predict foam');
await page.waitForTimeout(250);
await clickGame(60, 304, 'fizz powder');
await page.waitForTimeout(250);
await clickGame(160, 304, 'sour drops');
await page.waitForTimeout(250);
await clickGame(622, 304, 'stir tool');
await page.waitForTimeout(250);
await clickGame(858, 570, 'Mix!');
await page.waitForTimeout(800);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/08-success-confetti.png` });
await page.waitForTimeout(2200);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/09-results-stars.png` });

// Brain bonus quiz
await clickGame(110, 520, 'brain bonus');
await page.waitForTimeout(500);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/10-quiz.png` });
await clickGame(512, 310, 'first quiz answer');
await page.waitForTimeout(600);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/11-quiz-feedback.png` });

// Back to level select to confirm stars persisted on the card
await page.waitForTimeout(1500);
await clickGame(600, 588, 'more cards');
await page.waitForTimeout(700);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/12-level-select-stars.png` });

await browser.close();

if (errors.length) {
  console.error('Playtest found page errors:');
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}
console.log('New-features playtest completed without page errors.');
