import * as vscode from 'vscode'
import { planCodeActions, severityFromValue, type FixPayload } from '../core/codeActionPlan'

export class GrokCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] {
        const diagnostics = context.diagnostics.map(diagnostic => ({
            severity: severityFromValue(diagnostic.severity),
            message: diagnostic.message,
            startLine: diagnostic.range.start.line + 1,
            startCharacter: diagnostic.range.start.character + 1,
        }))

        return planCodeActions(diagnostics).map(planned => {
            const action = new vscode.CodeAction(planned.title, vscode.CodeActionKind.QuickFix)
            action.isPreferred = planned.isPreferred
            const payload: FixPayload = {
                uri: document.uri.toString(),
                range: {
                    startLine: range.start.line + 1,
                    startCharacter: range.start.character + 1,
                    endLine: range.end.line + 1,
                    endCharacter: range.end.character + 1,
                },
                diagnostics,
            }
            action.command = {
                command: planned.command,
                title: planned.title,
                arguments: [payload],
            }
            return action
        })
    }
}
