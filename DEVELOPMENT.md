# Development

Local build, test, and package instructions for **Grok in Editor**. Users should install from the VS Code Marketplace — see [README.md](README.md).

## Prerequisites

- [Bun](https://bun.sh/)
- Node.js 22+ (or a current LTS) — used by `node --test` and the Extension Development Host
- [Visual Studio Code](https://code.visualstudio.com/) 1.90+
- The Grok CLI, if you want to exercise the TUI

```bash
bun install
```

`bun.lock` is the lockfile. npm still works if you prefer (`npm install` / `package-lock.json`).

## Run in the Extension Development Host

1. Open this folder in VS Code.
2. Press **F5** (launch config **Run Extension**).
3. That compiles TypeScript (`bun run compile`) and opens a new Extension Development Host window.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run compile` | `tsc` → `out/` |
| `bun run watch` | Incremental compile |
| `bun run test` | Compiles, then runs `node --test` on `out/**/*.test.js` |
| `bun run package` | Compiles (`vscode:prepublish`) and builds a `.vsix` with `vsce` |

Unit tests cover prompt building, path resolution, terminal planning, and code-action planning. They do not launch VS Code or the Grok TUI. Smoke the real UI in the Development Host: Open / Fix / Explain / Improve, lightbulb with and without squiggles, missing CLI, unsaved file, `grok.cliPath`, light and dark icons.

## Layout

```
src/extension.ts          activation, command + code-action registration
src/vscode/               VS Code adapters (terminals, editors, diagnostics)
src/core/                 prompt, path, terminal, and code-action planning
media/                    Marketplace icon + command / terminal icons
out/                      compiled JavaScript (gitignored)
```

## Package a VSIX

```bash
bun run package
code --install-extension grok-in-editor-1.0.0.vsix
```

Inspect what `vsce` will ship with `bunx vsce ls`. `.vscodeignore` excludes `src/`, tests, source maps, and `*.vsix`.

## Pull requests

This repo does not use GitHub Issues. Send a pull request instead.