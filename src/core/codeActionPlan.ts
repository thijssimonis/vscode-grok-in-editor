import type { DiagnosticInput, LineRange } from './buildFixPrompt'

export type GrokActionCommand = 'grok.fixWithGrok' | 'grok.explainCode' | 'grok.improveCode'

export type PlannedCodeAction = {
    title: 'Fix with Grok' | 'Explain with Grok' | 'Improve with Grok'
    kind: 'quickfix'
    isPreferred: false
    command: GrokActionCommand
}

export type ActionPayload = {
    uri?: string
    range?: LineRange
    diagnostics?: DiagnosticInput[]
}

export type FixPayload = ActionPayload

export function severityFromValue(value: number): DiagnosticInput['severity'] {
    switch (value) {
        case 0:
            return 'error'
        case 1:
            return 'warning'
        case 2:
            return 'info'
        default:
            return 'hint'
    }
}

export function planCodeActions(diagnostics: DiagnosticInput[]): PlannedCodeAction[] {
    if (diagnostics.length > 0) {
        return [{ title: 'Fix with Grok', kind: 'quickfix', isPreferred: false, command: 'grok.fixWithGrok' }]
    }
    return [
        { title: 'Explain with Grok', kind: 'quickfix', isPreferred: false, command: 'grok.explainCode' },
        { title: 'Improve with Grok', kind: 'quickfix', isPreferred: false, command: 'grok.improveCode' },
    ]
}
