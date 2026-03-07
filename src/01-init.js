const vm = Scratch.vm;
const runtime = vm.runtime;

const INDENT_STEP_PX = 24;
const INDENT_STEP_TEXT = '  ';

// eslint-disable-next-line no-unused-vars -- used across concatenated src files
function pxToIndent(pixels) {
  return INDENT_STEP_TEXT.repeat(Math.round(pixels / INDENT_STEP_PX));
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
