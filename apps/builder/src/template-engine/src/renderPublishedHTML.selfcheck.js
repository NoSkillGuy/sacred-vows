/**
 * Self-check for the server-runnable snapshot renderer.
 *
 * Run:
 *   node apps/builder/src/template-engine/src/renderPublishedHTML.selfcheck.js
 *
 * This is intentionally framework-free (no Jest/Vitest dependency).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(process.cwd());
const renderer = path.join(root, 'apps/builder/src/template-engine/src/renderPublishedHTML.js');

function runRenderer(payload) {
  const res = spawnSync(process.execPath, [renderer, '--mode=bundle'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    throw new Error(`Renderer failed (${res.status}): ${res.stderr || res.stdout}`);
  }
  return JSON.parse(res.stdout);
}

function main() {
  const payload = {
    invitation: {
      layoutId: 'classic-scroll',
      data: {},
      layoutConfig: {},
    },
    translations: {},
  };

  const out = runRenderer(payload);

  assert.equal(typeof out.html, 'string');
  assert.equal(typeof out.css, 'string');
  assert.ok(out.manifest && typeof out.manifest === 'object');
  assert.ok(Array.isArray(out.assets));

  // At minimum we should rewrite any /assets/ references to ./assets/ in the HTML when present.
  // (This is a weak assertion: layouts may not always reference assets; that's OK.)
  if (out.html.includes('/assets/')) {
    throw new Error('Expected no absolute /assets/ references in bundled HTML');
  }

  // If assets were bundled, they must have the expected shape.
  for (const a of out.assets) {
    assert.ok(a.keySuffix && typeof a.keySuffix === 'string');
    assert.ok(!a.keySuffix.startsWith('/'));
    assert.ok(a.contentType && typeof a.contentType === 'string');
    assert.ok(a.bodyBase64 && typeof a.bodyBase64 === 'string');
  }

  // If a layout references known assets, ensure we bundle at least one.
  if (out.html.includes('./assets/')) {
    assert.ok(out.assets.length > 0, 'Expected at least 1 asset when HTML references ./assets/');
  }

  // eslint-disable-next-line no-console
  console.log('OK: renderPublishedHTML bundle self-check passed');
}

main();


