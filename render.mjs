// Renders index.html frame by frame and pipes JPEG frames into ffmpeg.
// Usage: node render.mjs [out.mp4] [fps]      stills: node render.mjs --stills 1,2.2,4
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = 'file://' + path.resolve('index.html') + '?render';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
// share cue times with sound.py so audio stays locked to the animation
writeFileSync('cues.json', JSON.stringify(await page.evaluate(() => window.CUES), null, 1));

if (args[0] === '--stills') {
  for (const t of args[1].split(',').map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: `stills/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 85 });
  }
} else {
  const out = args[0] || 'rashad-mahmood-reel.mp4';
  const fps = Number(args[1] || 60);
  const dur = await page.evaluate(() => window.DUR);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.render(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`frame ${i}/${n}\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
