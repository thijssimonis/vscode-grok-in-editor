export type DiagnosticInput = {
    severity: 'error' | 'warning' | 'info' | 'hint'
    message: string
    startLine: number
    startCharacter: number
}

export type LineRange = {
    startLine: number
    startCharacter: number
    endLine: number
    endCharacter: number
}

export type GrokAction = 'fix' | 'explain' | 'improve'

export type BuildActionPromptInput = {
    action: GrokAction
    filePath: string
    languageId: string
    source: string
    selection?: LineRange
    diagnostics: DiagnosticInput[]
    maxSnippetChars?: number
}

export type BuildFixPromptInput = Omit<BuildActionPromptInput, 'action'> & { action?: GrokAction }

const DEFAULT_MAX_SNIPPET_CHARS = 8000
const WINDOW_RADIUS = 40

export function buildActionPrompt(input: BuildActionPromptInput): string {
    const maxSnippetChars = input.maxSnippetChars ?? DEFAULT_MAX_SNIPPET_CHARS
    const lines = splitLines(input.source)
    const { start, end } = snippetRange(lines.length, input.selection, input.diagnostics)
    const { text: snippet, truncated } = formatSnippet(lines, start, end, maxSnippetChars)
    const copy = actionCopy(input.action, input.diagnostics.length > 0)

    const parts = [
        copy.intro,
        '',
        `File: ${input.filePath}`,
        `Language: ${input.languageId}`,
        `Lines: ${start}-${end}`,
        '',
    ]

    if (input.diagnostics.length > 0 || input.action === 'fix') {
        parts.push(
            'Diagnostics:',
            input.diagnostics.length === 0
                ? 'No editor diagnostics were attached. Please review this file and fix problems.'
                : input.diagnostics
                      .map(d => `- ${d.severity}: ${d.message} (line ${d.startLine}, col ${d.startCharacter})`)
                      .join('\n'),
            ''
        )
    }

    parts.push(
        'Code:',
        '```',
        snippet,
        '```',
        truncated ? '' : '',
        truncated
            ? 'The snippet was truncated because it was too large. Open the file and read the surrounding code if needed.'
            : '',
        '',
        ...copy.outro
    )

    return parts
        .filter((line, index, all) => !(line === '' && all[index - 1] === ''))
        .join('\n')
        .trimEnd()
        .concat('\n')
}

export function buildFixPrompt(input: BuildFixPromptInput): string {
    return buildActionPrompt({ ...input, action: input.action ?? 'fix' })
}

function actionCopy(action: GrokAction, hasDiagnostics: boolean): { intro: string; outro: string[] } {
    if (action === 'explain') {
        return {
            intro: 'Explain this code.',
            outro: [
                'Provide a clear, concise explanation of:',
                '1. The purpose and functionality',
                '2. Key components and how they interact',
                '3. Important patterns or techniques used',
            ],
        }
    }
    if (action === 'improve') {
        return {
            intro: 'Improve this code.',
            outro: [
                'Suggest and apply improvements for:',
                '1. Readability and maintainability',
                '2. Performance',
                '3. Best practices and patterns',
                '4. Error handling and edge cases',
                '',
                'Apply the improvements in the file. Keep the change focused.',
            ],
        }
    }
    return {
        intro: hasDiagnostics ? 'Fix the problem in this file.' : 'Review this file and fix problems.',
        outro: ['Apply the fix in the file. Keep the change as small as possible.'],
    }
}

function splitLines(source: string): string[] {
    return source.length === 0 ? [''] : source.split(/\r?\n/)
}

function snippetRange(
    lineCount: number,
    selection: LineRange | undefined,
    diagnostics: DiagnosticInput[]
): { start: number; end: number } {
    if (selection) {
        return clampRange(selection.startLine, selection.endLine, lineCount)
    }
    if (diagnostics.length > 0) {
        const center = diagnostics[0].startLine
        return clampRange(center - WINDOW_RADIUS, center + WINDOW_RADIUS, lineCount)
    }
    return { start: 1, end: lineCount }
}

function clampRange(start: number, end: number, lineCount: number): { start: number; end: number } {
    const s = Math.min(Math.max(1, start), Math.max(1, lineCount))
    const e = Math.min(Math.max(s, end), Math.max(1, lineCount))
    return { start: s, end: e }
}

function formatSnippet(
    lines: string[],
    start: number,
    end: number,
    maxChars: number
): { text: string; truncated: boolean } {
    const width = String(end).length
    const numbered: string[] = []
    for (let line = start; line <= end; line++) {
        const body = lines[line - 1] ?? ''
        numbered.push(`${String(line).padStart(width, ' ')} | ${body}`)
    }
    const text = numbered.join('\n')
    if (text.length <= maxChars) {
        return { text, truncated: false }
    }
    return { text: `${text.slice(0, Math.max(0, maxChars - 14))}\n… [truncated]`, truncated: true }
}
