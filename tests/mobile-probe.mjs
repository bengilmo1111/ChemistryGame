import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const SCREENSHOT_DIR = 'tests/screenshots/mobile';
mkdirSync(SCREENSHOT_DIR, { recursive: true });
const runId = Date.now();

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices['iPhone 13'],
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();

const consoleMessages = [];
page.on('console', (msg) => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
page.on('pageerror', (err) => consoleMessages.push(`pageerror: ${err.message}\n${err.stack ?? ''}`));
page.on('requestfailed', (req) => consoleMessages.push(`requestfailed: ${req.url()} - ${req.failure()?.errorText}`));

const target = process.env.PROBE_URL ?? 'https://chemistry-game-six.vercel.app/';
await page.goto(target, { waitUntil: 'load', timeout: 30000 });
await page.screenshot({ path: `${SCREENSHOT_DIR}/${runId}-01-load.png` });

await page.waitForTimeout(800);
await page.screenshot({ path: `${SCREENSHOT_DIR}/${runId}-02-after-load.png` });

await page.waitForTimeout(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/${runId}-03-after-2s.png` });

await page.waitForTimeout(3000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/${runId}-04-after-5s.png` });

// Check what's on screen
const sceneInfo = await page.evaluate(() => {
  const game = window.madFlaskGame;
  if (!game) return { game: 'missing', readyState: document.readyState };
  const active = game.scene.scenes.filter((s) => s.scene.isActive()).map((s) => s.scene.key);
  return {
    game: 'present',
    isBooted: game.isBooted,
    isRunning: game.isRunning,
    activeScenes: active,
    canvasSize: game.canvas ? { w: game.canvas.width, h: game.canvas.height, displayW: game.canvas.offsetWidth, displayH: game.canvas.offsetHeight } : null,
  };
});
console.log('SCENE:', JSON.stringify(sceneInfo, null, 2));

console.log('--- CONSOLE/PAGE EVENTS ---');
consoleMessages.forEach((m) => console.log(m));

await browser.close();
