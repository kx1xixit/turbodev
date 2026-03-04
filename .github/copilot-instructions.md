# Copilot Instructions for TurboDev

## Project Overview

TurboDev is a custom extension for [TurboWarp](https://turbowarp.org/) (a Scratch mod) that provides an interactive developer console with CLI commands, rich logging, async queries, a performance monitor, and a settings engine.

The entire extension is a single JavaScript file built from `src/01-core.js` and bundled by `scripts/build.js` into `build/extension.js`.

## Repository Structure

```text
src/
  01-core.js        # Main extension class — all blocks and logic live here
  manifest.json     # Extension metadata (name, id, version, author, license)
scripts/
  build.js          # Bundles src files into build/extension.js
build/              # Generated output — do NOT edit manually or commit
  extension.js
  pretty.extension.js
  min.extension.js
.github/
  workflows/
    ci.yml          # Lint, spell-check, CodeQL, build, and verify
    cd.yml          # Release automation on version tags
```

## Build, Lint & Format

```bash
npm install          # Install dev dependencies (first time only)
npm run lint         # ESLint — must pass with no errors before merging
npm run format       # Prettier — auto-formats src/
npm run spellcheck   # cspell — spell-checks source files
npm run build        # Produces build/extension.js (and pretty/min variants)
npm run fullstack    # format + lint + spellcheck + build (all-in-one)
```

The CI pipeline runs lint, spellcheck, CodeQL, and build checks on every pull request. All checks must pass before merging.

## Code Conventions

### File organization

- Keep all block definitions and implementation in `src/01-core.js`.
- The build script will concatenate any additional `src/*.js` files in lexicographic order (prefix with numbers like `01-`, `02-` to control ordering), but the project preference is to keep everything in `01-core.js`.

### Adding a new block

1. Add a block definition object inside the `blocks` array in `getInfo()`.
2. Implement the corresponding method on the extension class.
3. Bind the method in the constructor alongside the other bindings.

### Boolean arguments

Scratch/TurboWarp can pass boolean arguments as the boolean `true`, the string `'true'`, or (for `YES_NO` menus) the string `'yes'`. Always handle all of these:

```javascript
const value = String(args.ENABLED).toLowerCase();
const enabled = args.ENABLED === true || value === 'true' || value === 'yes';
```

### Logging helpers

- `_addLine(text, baseColor)` — appends a line to the console; pass `baseColor` instead of embedding `@c` tags directly.
- `_parseFormatting(text)` — parses TurboDev's inline markup (e.g. `@c`, `@h`, `@b`, `@i`) into HTML segments; called internally by `_addLine`.

### Log block / opcode naming

The main console-related opcodes exposed by `getInfo()` are:

- `printText` — print a line of text to the console
- `startLoading` — begin a loading / in-progress state
- `finishLoading` — end a loading state
- `replySuccess` — indicate a successful result
- `replyError` — indicate an error result
- `queryUser` — prompt the user for input

### Inline text styling

TurboDev's terminal supports a simple markup syntax for user-visible strings:

| Tag | Effect |
|-----|--------|
| `@c #hex:text@c` | Colored text |
| `@h #hex:text@h` | Highlighted text |
| `@b:text@b` | Bold |
| `@i:text@i` | Italic |

Never embed `@c` tags in user-provided text; pass colour via `baseColor` to avoid injection.

### Extension metadata

Update `src/manifest.json` when changing the extension name, version, or author. The `version` field must follow SemVer (`MAJOR.MINOR.PATCH`). The `id` field must match `/^[a-zA-Z][a-zA-Z0-9_]*$/` (start with a letter, then letters, digits, or underscores only).

## PR & Commit Guidelines

- Follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, or `chore:` prefixes.
- Every PR must include a non-empty description explaining what changed and why.
- Run `npm run lint` and `npm run build` locally before opening a PR.

## Testing

There is no automated test suite. Testing is done manually:

1. `npm run build`
2. Open [TurboWarp editor](https://turbowarp.org/editor)
3. Load `build/extension.js` as a custom extension
4. Exercise the changed blocks and verify behaviour in the console UI

## Release Process

1. Update `version` in `src/manifest.json` (SemVer).
2. Ensure `npm run lint` and `npm run build` pass cleanly.
3. Create and push a version tag — the CD workflow creates the GitHub Release automatically.

```bash
git tag v1.2.3
git push origin v1.2.3
```
