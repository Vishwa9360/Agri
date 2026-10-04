import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('PWA Manifest & Service Worker Verification (SRS Section 17)', async (t) => {
  await t.test('manifest.json has required fields', () => {
    const manifestPath = path.resolve('public/manifest.json');
    assert.equal(fs.existsSync(manifestPath), true, 'manifest.json must exist');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.name, 'AgroSense Smart Farming Management System');
    assert.equal(manifest.short_name, 'AgroSense');
    assert.equal(manifest.display, 'standalone');
    assert.ok(manifest.icons.length > 0);
  });

  await t.test('sw.js service worker implements offline caching', () => {
    const swPath = path.resolve('public/sw.js');
    assert.equal(fs.existsSync(swPath), true, 'sw.js must exist in public');

    const swContent = fs.readFileSync(swPath, 'utf8');
    assert.ok(swContent.includes('addEventListener(\'install\''), 'Service worker must handle install');
    assert.ok(swContent.includes('addEventListener(\'fetch\''), 'Service worker must handle fetch caching');
  });
});
