import * as vscode from 'vscode'
import { buildActionPrompt, type DiagnosticInput, type GrokAction, type LineRange } from '../core/buildFixPrompt'
import { severityFromValue, type ActionPayload } from '../core/codeActionPlan'
import { resolveGrokPath } from '../core/resolveGrokPath'
import { planGrokTerminal, type TerminalMode } from '../core/terminalPlan'

const INSTALL_HINT =
    'Install Grok with: curl -fsSL https://x.ai/cli/install.sh | bash — or set grok.cliPath to the binary.'

export type OpenGrokOptions = {
    mode: TerminalMode
    prompt?: string
}

export async function openGrok(context: vscode.ExtensionContext, options: OpenGrokOptions): Promise<void> {
    const config = vscode.workspace.getConfiguration('grok')
    const cliPath = config.get<string>('cliPath', '')
    const extraArgs = config.get<string[]>('extraArgs', [])
    const fixViewColumn = config.get<'active' | 'beside'>('fixViewColumn', 'active')

    const resolved = resolveGrokPath({ cliPath })
    if (!resolved.ok) {
        void vscode.window.showErrorMessage(`Grok CLI not found. ${INSTALL_HINT}`)
        return
    }

    const cwd = resolveCwd(vscode.window.activeTextEditor?.document.uri)
    if (!cwd) {
        void vscode.window.showErrorMessage('Open a folder or file so Grok has a working directory.')
        return
    }

    const plan = planGrokTerminal({
        mode: options.mode,
        grokPath: resolved.path,
        cwd,
        prompt: options.prompt,
        extraArgs,
        viewColumn: options.mode === 'action' ? fixViewColumn : 'active',
    })

    const viewColumn = plan.location.viewColumn === 'Beside' ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active

    const terminal = vscode.window.createTerminal({
        name: plan.name,
        cwd: plan.cwd,
        shellPath: plan.shellPath,
        shellArgs: plan.shellArgs,
        env: plan.env,
        strictEnv: plan.strictEnv,
        hideFromUser: plan.hideFromUser,
        iconPath: {
            light: vscode.Uri.joinPath(context.extensionUri, 'media', 'grok-light.svg'),
            dark: vscode.Uri.joinPath(context.extensionUri, 'media', 'grok-dark.svg'),
        },
        isTransient: plan.isTransient,
        location: {
            viewColumn,
            preserveFocus: plan.location.preserveFocus,
        },
    })
    terminal.show(false)
}

export async function runGrokAction(
    context: vscode.ExtensionContext,
    action: GrokAction,
    payload?: ActionPayload
): Promise<void> {
    const editor = await resolveEditor(payload?.uri)
    if (!editor) {
        void vscode.window.showErrorMessage('Open a file to use Grok.')
        return
    }

    if (editor.document.isUntitled) {
        const saved = await editor.document.save()
        if (!saved || editor.document.isUntitled) {
            void vscode.window.showErrorMessage('Save the file before using Grok.')
            return
        }
    }

    await vscode.workspace.saveAll(false)

    const range = payload?.range ?? selectionToRange(editor.selection)
    const diagnostics = payload?.diagnostics ?? collectDiagnostics(editor.document, range)
    const selection = editor.selection.isEmpty ? undefined : selectionToRange(editor.selection)

    const prompt = buildActionPrompt({
        action,
        filePath: vscode.workspace.asRelativePath(editor.document.uri),
        languageId: editor.document.languageId,
        source: editor.document.getText(),
        selection,
        diagnostics,
    })

    await openGrok(context, { mode: 'action', prompt })
}

async function resolveEditor(uriString: string | undefined): Promise<vscode.TextEditor | undefined> {
    if (uriString) {
        const uri = vscode.Uri.parse(uriString)
        const document = await vscode.workspace.openTextDocument(uri)
        return vscode.window.showTextDocument(document, { preview: false, preserveFocus: true })
    }
    return vscode.window.activeTextEditor
}

function selectionToRange(selection: vscode.Selection): LineRange {
    return {
        startLine: selection.start.line + 1,
        startCharacter: selection.start.character + 1,
        endLine: selection.end.line + 1,
        endCharacter: selection.end.character + 1,
    }
}

function collectDiagnostics(document: vscode.TextDocument, range?: LineRange): DiagnosticInput[] {
    const vscodeRange = range
        ? new vscode.Range(range.startLine - 1, range.startCharacter - 1, range.endLine - 1, range.endCharacter - 1)
        : undefined

    return vscode.languages
        .getDiagnostics(document.uri)
        .filter(diagnostic => !vscodeRange || diagnostic.range.intersection(vscodeRange))
        .map(diagnostic => ({
            severity: severityFromValue(diagnostic.severity),
            message: diagnostic.message,
            startLine: diagnostic.range.start.line + 1,
            startCharacter: diagnostic.range.start.character + 1,
        }))
}

function resolveCwd(activeUri: vscode.Uri | undefined): string | undefined {
    if (activeUri && activeUri.scheme === 'file') {
        const folder = vscode.workspace.getWorkspaceFolder(activeUri)
        if (folder) {
            return folder.uri.fsPath
        }
        const dir = vscode.Uri.joinPath(activeUri, '..').fsPath
        if (dir) {
            return dir
        }
    }
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
}
