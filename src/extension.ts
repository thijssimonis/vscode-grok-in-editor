import * as vscode from 'vscode'
import { GrokCodeActionProvider } from './vscode/codeActions'
import { openGrok, runGrokAction } from './vscode/openGrok'

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('grok.openInEditor', () => openGrok(context, { mode: 'open' })),
        vscode.commands.registerCommand('grok.fixWithGrok', payload => runGrokAction(context, 'fix', payload)),
        vscode.commands.registerCommand('grok.explainCode', payload => runGrokAction(context, 'explain', payload)),
        vscode.commands.registerCommand('grok.improveCode', payload => runGrokAction(context, 'improve', payload)),
        vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, new GrokCodeActionProvider(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
        })
    )
}

export function deactivate(): void {}
