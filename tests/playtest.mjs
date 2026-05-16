import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const SCREENSHOT_DIR = 'tests/screenshots';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const errors = [];
const warnings = [];
const consoleMessages = [];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 });
const page = await context.newPage();

page.on('console', (msg) => {
  const text = `${msg.type()}: ${msg.text()}`;
  consoleMessages.push(text);
  if (msg.type() === 'error') errors.push(text);
  if (msg.type() === 'warning') warnings.push(text);
});
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

await page.waitForSelector('canvas', { timeout: 15000 });
const canvas = await page.$('canvas');
await page.waitForTimeout(1500);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/01-boot.png` });

await page.waitForTimeout(800);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/02-menu.png` });

const box = await canvas.boundingBox();
const sx = box.width / 1024;
const sy = box.height / 640;
const toScreen = (gx, gy) => ({ x: box.x + gx * sx, y: box.y + gy * sy });

async function clickGame(gx, gy, label) {
  const p = toScreen(gx, gy);
  await page.mouse.click(p.x, p.y);
  if (label) console.log(`click ${label} at game(${gx},${gy})`);
}

async function dragGame(fromX, fromY, toX, toY, label) {
  const a = toScreen(fromX, fromY);
  const b = toScreen(toX, toY);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.waitForTimeout(60);
  const steps = 16;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    await page.mouse.move(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  if (label) console.log(`drag ${label} → flask`);
}

// MenuScene: click "Start Experiments" at (512, 398)
await clickGame(512, 398, 'Start Experiments');
await page.waitForTimeout(600);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/03-level-select.png` });

// LevelSelectScene: first card "Experiment!" button at y+82=318
await clickGame(206, 318, 'Foamy Fountain experiment');
await page.waitForTimeout(800);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/04-lab-initial.png` });

// LabScene: predict "Foam climbs up" at (88,162)
await clickGame(88, 162, 'predict Foam');
await page.waitForTimeout(300);

await clickGame(60, 304, 'tap Fizz Powder');
await page.waitForTimeout(400);

await clickGame(160, 304, 'tap Sour Drops');
await page.waitForTimeout(400);

// Click stir tool (key=stirred) at (622, 304)
await clickGame(622, 304, 'stir tool');
await page.waitForTimeout(400);

await canvas.screenshot({ path: `${SCREENSHOT_DIR}/05-lab-ready.png` });

// Click Mix at (858, 570)
await clickGame(858, 570, 'Mix!');
await page.waitForTimeout(2700); // wait for outcome + delayed scene change
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/06-results.png` });

// Replay back to lab to test the Reset Flask button
await clickGame(384, 588, 'Replay');
await page.waitForTimeout(800);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/07-lab-replay.png` });

// Drag-and-drop pour: fizz-powder bottle → flask
await dragGame(60, 304, 392, 386, 'fizz-powder');
await page.waitForTimeout(400);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/08-after-drag.png` });

// Reset Flask at (666, 570)
await clickGame(666, 570, 'Reset Flask');
await page.waitForTimeout(500);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/09-after-reset.png` });

// Back to cards
await clickGame(92, 44, 'Cards');
await page.waitForTimeout(600);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/10-cards-again.png` });

// Pressure-pop card index 4 → col 1, row 1 → x=512, y=466; button at y+82=548
await clickGame(512, 548, 'Pressure Pop experiment');
await page.waitForTimeout(600);

// Predict "Pressure pops" — index 4 row 1 col 0: (88, 162 + 44) = (88, 206)
await clickGame(88, 206, 'predict Pressure');
await page.waitForTimeout(200);

// Pressure-pop required: fizz-powder, sour-drops, goo-gel; required action sealed
await clickGame(60, 304, 'tap Fizz Powder');
await page.waitForTimeout(300);
await clickGame(160, 304, 'tap Sour Drops');
await page.waitForTimeout(300);
// goo-gel (index 5 → col 2 row 1)
await clickGame(260, 396, 'tap Goo Gel');
await page.waitForTimeout(300);

// Seal tool: index 3, y = 304 + 3*38 = 418
await clickGame(622, 418, 'seal tool');
await page.waitForTimeout(300);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/11-pressure-ready.png` });

// Mix!
await clickGame(858, 570, 'Mix!');
await page.waitForTimeout(2700);
await canvas.screenshot({ path: `${SCREENSHOT_DIR}/12-pressure-result.png` });

console.log('--- CONSOLE ---');
consoleMessages.forEach((m) => console.log(m));
console.log('--- ERRORS ---');
errors.forEach((e) => console.log(e));
console.log('--- WARNINGS ---');
warnings.forEach((w) => console.log(w));

await browser.close();

if (errors.length > 0) {
  console.error(`Playtest finished with ${errors.length} errors.`);
  process.exit(1);
}
console.log('Playtest finished.');
