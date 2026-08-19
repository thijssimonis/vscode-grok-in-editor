# Grok in Editor

Open the [Grok Build](https://x.ai/build) TUI as a normal editor tab — next to your files, not in the bottom panel or a sidebar. Fix, explain, or improve code from the command palette, the editor context menu, or the lightbulb.

This extension is unofficial and free. It launches the Grok CLI you already have installed; it does not ship a model or an API key.

## Install

1. In VS Code, open **Extensions** (`⌘⇧X` / `Ctrl+Shift+X`).
2. Search for **Grok in Editor**.
3. Install **Grok in Editor** by Thijs Simonis.

Requires [Visual Studio Code](https://code.visualstudio.com/) 1.90 or later (or a compatible editor).

## Requirements

Install the Grok CLI on your machine:

```bash
curl -fsSL https://x.ai/cli/install.sh | bash
```

If VS Code was launched from the Dock or Finder and cannot see `grok`, either add `~/.grok/bin` to your GUI `PATH` or set **Grok: Cli Path** (`grok.cliPath`) to the absolute binary, for example `/Users/you/.grok/bin/grok`.

## Usage

| Command | What it does |
| --- | --- |
| **Grok: Open in Editor** | Opens Grok as an editor tab and starts the TUI. A second run opens another Grok tab. |
| **Grok: Fix Code** | Saves, then opens a new Grok tab asked to fix the current file, any squiggles, and the selected (or nearby) code. |
| **Grok: Explain Code** | Same, but asks Grok to explain the selected (or nearby) code. |
| **Grok: Improve Code** | Same, but asks Grok to improve the selected (or nearby) code. |

Also available from:

- The editor title bar (**Open in Editor**)
- Right-click → **Grok** (Fix, Explain, Improve)
- The lightbulb / **Quick Fix** (`⌘.` / `Ctrl+.`) — **Fix with Grok** when the file has squiggles; **Explain with Grok** and **Improve with Grok** when it does not. None of these are marked preferred, so the language server’s own fixes stay first.

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `grok.cliPath` | `""` | Absolute path to the `grok` binary. Empty means: `PATH`, then `~/.grok/bin/grok`. |
| `grok.fixViewColumn` | `"active"` | `"active"` keeps the Fix tab in the same group; `"beside"` splits. |
| `grok.extraArgs` | `[]` | Extra CLI args before the optional prompt (for example `["--minimal"]`). `-p` / `--single` / `--always-approve` are ignored. |

## How it launches Grok

The extension starts the `grok` process as the terminal’s shell, in the editor area. **Open in Editor** uses no prompt. Fix, Explain, and Improve pass the prompt as a positional argument so Grok stays interactive — they do not use `grok -p`, which would run headless and exit.

Because Grok is the process, login-shell rc files do not run. The tab also opts out of other extensions’ terminal auto-activation (Python venv `source activate`, conda, direnv, and similar) so those commands are not typed into the TUI.

## Troubleshooting

**“Grok CLI not found.”** Install the CLI with the command above, or set `grok.cliPath` to the binary.

**“Open a folder or file so Grok has a working directory.”** Open a workspace folder or a saved file first.

**“Save the file before using Grok.”** Untitled buffers must be saved before Fix / Explain / Improve.

## License

[MIT](LICENSE) © [Thijs Simonis](https://thijssimonis.nl)

There is no issue tracker. Changes go in as [pull requests](https://github.com/thijssimonis/vscode-grok-in-editor/pulls).

Developers: see [DEVELOPMENT.md](DEVELOPMENT.md).
