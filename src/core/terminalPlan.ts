import { buildGrokTerminalEnv } from './grokTerminalEnv'

export type TerminalMode = 'open' | 'action'

export type TerminalPlanInput = {
    mode: TerminalMode
    grokPath: string
    cwd: string
    prompt?: string
    extraArgs?: string[]
    viewColumn?: 'active' | 'beside'
    env?: NodeJS.Dict<string>
}

export type EditorViewColumn = 'Active' | 'Beside'

export type TerminalPlan = {
    name: 'Grok'
    cwd: string
    shellPath: string
    shellArgs: string[]
    location: { viewColumn: EditorViewColumn; preserveFocus: false }
    isTransient: true
    hideFromUser: true
    strictEnv: true
    env: Record<string, string>
}

const FORBIDDEN_ARGS = new Set(['-p', '--single', '--always-approve', '--yolo'])

export function planGrokTerminal(input: TerminalPlanInput): TerminalPlan {
    const extraArgs = (input.extraArgs ?? []).filter(arg => !FORBIDDEN_ARGS.has(arg))
    const shellArgs = [...extraArgs]
    if (input.mode === 'action' && input.prompt) {
        shellArgs.push(input.prompt)
    }

    const viewColumn: EditorViewColumn = input.viewColumn === 'beside' ? 'Beside' : 'Active'

    return {
        name: 'Grok',
        cwd: input.cwd,
        shellPath: input.grokPath,
        shellArgs,
        location: { viewColumn, preserveFocus: false },
        isTransient: true,
        hideFromUser: true,
        strictEnv: true,
        env: buildGrokTerminalEnv(input.env),
    }
}
