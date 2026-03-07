const vm = Scratch.vm;
const runtime = vm.runtime;

const INDENT_STEP_PX = 24;
const INDENT_STEP_TEXT = '  ';

// eslint-disable-next-line no-unused-vars
function pxToIndent(paddingLeft) {
  const px = Number.isFinite(paddingLeft) ? paddingLeft : 0;
  const steps = Math.max(0, Math.round(px / INDENT_STEP_PX));
  return INDENT_STEP_TEXT.repeat(steps);
}

// --- Singleton & Cleanup ---
// Check for existing instance in runtime or window to prevent duplicates
// Using 'ext_kxTurboDev' to match the ID and standard naming convention
if (runtime.ext_kxTurboDev) {
  try {
    runtime.ext_kxTurboDev.dispose();
  } catch (e) {
    console.warn('TurboDev: Failed to dispose previous instance', e);
  }
}
