#!/usr/bin/env node
/**
 * Runtime test for the built extension.
 * Uses createRequire to load build/extension.js as CommonJS so top-level
 * runtime errors (e.g. bare require calls, reference errors) are caught.
 * Also reports bundle size and block count.
 *
 * TurboDev requires a browser-like environment (DOM, Scratch.vm, localStorage,
 * etc.), so comprehensive stubs are provided here to allow Node.js loading.
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const BUILD_FILE = path.join(__dirname, '../build/extension.js');

// ---------------------------------------------------------------------------
// Browser environment stubs
// ---------------------------------------------------------------------------

/** Create a minimal DOM element stub that accepts arbitrary property access. */
function makeElement(tag = 'div') {
  return {
    tagName: tag.toUpperCase(),
    style: new Proxy({}, { get: (t, k) => t[k] ?? '', set: (t, k, v) => { t[k] = v; return true; } }),
    dataset: {},
    classList: {
      _s: new Set(),
      add(...c) { c.forEach(x => this._s.add(x)); },
      remove(...c) { c.forEach(x => this._s.delete(x)); },
      toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); },
      contains(c) { return this._s.has(c); },
    },
    _children: [],
    appendChild(child) { this._children.push(child); return child; },
    removeChild(child) { const i = this._children.indexOf(child); if (i >= 0) this._children.splice(i, 1); return child; },
    replaceChildren() { this._children = []; },
    remove() {},
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    getAttribute() { return null; },
    getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    closest() { return null; },
    getContext() { return null; },
    scrollTop: 0,
    scrollHeight: 0,
    offsetHeight: 0,
    focus() {},
    blur() {},
    value: '',
    textContent: '',
    innerHTML: '',
    className: '',
    id: '',
    title: '',
    type: '',
    placeholder: '',
    disabled: false,
    checked: false,
    min: '',
    max: '',
    step: '',
  };
}

globalThis.document = {
  _elements: new Map(),
  getElementById(id) { return this._elements.get(id) ?? null; },
  createElement(tag) { return makeElement(tag); },
  createTextNode(text) { return { nodeValue: text, textContent: text }; },
  head: makeElement('head'),
  body: makeElement('body'),
  addEventListener() {},
  removeEventListener() {},
};

globalThis.window = {
  location: { pathname: '/test' },
  addEventListener() {},
  removeEventListener() {},
  innerHeight: 768,
  innerWidth: 1024,
};

const _lsData = {};
globalThis.localStorage = {
  getItem: key => _lsData[key] ?? null,
  setItem: (key, val) => { _lsData[key] = String(val); },
  removeItem: key => { delete _lsData[key]; },
  clear: () => { for (const k in _lsData) delete _lsData[k]; },
};

globalThis.requestAnimationFrame = cb => setTimeout(cb, 16);
globalThis.cancelAnimationFrame = id => clearTimeout(id);
globalThis.performance = { now: () => Date.now() };

// ---------------------------------------------------------------------------
// Scratch stub
// ---------------------------------------------------------------------------

let registeredExtension = null;
globalThis.Scratch = {
  vm: {
    runtime: { off() {}, on() {} },
  },
  extensions: {
    register: ext => {
      registeredExtension = ext;
    },
    unsandboxed: true,
  },
  BlockType: {
    COMMAND: 'command',
    BOOLEAN: 'Boolean',
    REPORTER: 'reporter',
    EVENT: 'event',
    HAT: 'hat',
    LABEL: 'label',
  },
  ArgumentType: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'Boolean',
  },
  translate: str => str,
};

require(BUILD_FILE);

if (!registeredExtension) {
  console.error('Runtime check failed: extension did not call Scratch.extensions.register.');
  process.exit(1);
}
console.log('Runtime check passed.');

// Report bundle size
const size = (fs.statSync(BUILD_FILE).size / 1024).toFixed(2);
console.log(`Bundle size:   ${size} KB`);

// Report block count via getInfo()
if (registeredExtension && typeof registeredExtension.getInfo === 'function') {
  try {
    const info = registeredExtension.getInfo();
    const blockCount = info?.blocks?.length ?? 0;
    console.log(`Blocks:        ${blockCount} (extension id: ${info?.id})`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`Could not call getInfo() on registered extension: ${detail}`);
    process.exitCode = 1;
  }
} else {
  console.warn('Could not retrieve block info from registered extension.');
  process.exitCode = 1;
}
