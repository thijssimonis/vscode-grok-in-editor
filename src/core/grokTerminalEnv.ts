const ACTIVATION_ENV_KEYS = new Set([
    'VIRTUAL_ENV',
    'VIRTUAL_ENV_PROMPT',
    'CONDA_DEFAULT_ENV',
    'CONDA_PREFIX',
    'CONDA_PROMPT_MODIFIER',
    'CONDA_PYTHON_EXE',
    'CONDA_SHLVL',
    'CONDA_ENV_PATH',
    'MAMBA_SHLVL',
    'POETRY_ACTIVE',
    'PIPENV_ACTIVE',
    'PIPENV_PIPFILE',
    'PYENV_VIRTUAL_ENV',
    'PIXI_ENVIRONMENT_NAME',
    'PIXI_ENVIRONMENT_PATH',
    'PIXI_PROMPT',
    'PIXI_IN_SHELL',
    'PIXI_PROJECT_MANIFEST',
    'VSCODE_INJECTION',
    'VSCODE_NONCE',
    'VSCODE_ENV_REPLACE',
    'VSCODE_ENV_PREPEND',
    'VSCODE_ENV_APPEND',
])

function isActivationEnvKey(key: string): boolean {
    if (ACTIVATION_ENV_KEYS.has(key)) {
        return true
    }
    if (key.startsWith('_OLD_VIRTUAL_') || key.startsWith('_OLD_CONDA_')) {
        return true
    }
    if (/^CONDA_PREFIX_\d+$/.test(key)) {
        return true
    }
    if (key.startsWith('DIRENV_')) {
        return true
    }
    return false
}

export function buildGrokTerminalEnv(source: NodeJS.Dict<string> = process.env): Record<string, string> {
    const env: Record<string, string> = {}
    for (const [key, value] of Object.entries(source)) {
        if (typeof value !== 'string' || isActivationEnvKey(key)) {
            continue
        }
        env[key] = value
    }
    env.TERM = 'xterm-256color'
    env.COLORTERM = 'truecolor'
    return env
}
