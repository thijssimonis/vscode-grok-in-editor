import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildGrokTerminalEnv } from './grokTerminalEnv'

describe('buildGrokTerminalEnv', () => {
    it('drops venv, conda, and direnv activation vars but keeps PATH and HOME', () => {
        const env = buildGrokTerminalEnv({
            HOME: '/Users/dev',
            PATH: '/proj/.venv/bin:/usr/bin',
            VIRTUAL_ENV: '/proj/.venv',
            VIRTUAL_ENV_PROMPT: '.venv',
            _OLD_VIRTUAL_PATH: '/usr/bin',
            CONDA_PREFIX: '/opt/miniconda3/envs/ml',
            CONDA_DEFAULT_ENV: 'ml',
            CONDA_SHLVL: '1',
            CONDA_PREFIX_1: '/opt/miniconda3',
            CONDA_PROMPT_MODIFIER: '(ml) ',
            DIRENV_DIR: '/proj',
            POETRY_ACTIVE: '1',
            PIPENV_ACTIVE: '1',
            PIXI_IN_SHELL: '1',
            TERM: 'dumb',
        })

        assert.equal(env.HOME, '/Users/dev')
        assert.equal(env.PATH, '/proj/.venv/bin:/usr/bin')
        assert.equal('VIRTUAL_ENV' in env, false)
        assert.equal('VIRTUAL_ENV_PROMPT' in env, false)
        assert.equal('_OLD_VIRTUAL_PATH' in env, false)
        assert.equal('CONDA_PREFIX' in env, false)
        assert.equal('CONDA_DEFAULT_ENV' in env, false)
        assert.equal('CONDA_SHLVL' in env, false)
        assert.equal('CONDA_PREFIX_1' in env, false)
        assert.equal('CONDA_PROMPT_MODIFIER' in env, false)
        assert.equal('DIRENV_DIR' in env, false)
        assert.equal('POETRY_ACTIVE' in env, false)
        assert.equal('PIPENV_ACTIVE' in env, false)
        assert.equal('PIXI_IN_SHELL' in env, false)
        assert.equal(env.TERM, 'xterm-256color')
        assert.equal(env.COLORTERM, 'truecolor')
    })

    it('skips undefined values', () => {
        const env = buildGrokTerminalEnv({
            HOME: '/Users/dev',
            EMPTY: undefined,
        })

        assert.equal(env.HOME, '/Users/dev')
        assert.equal('EMPTY' in env, false)
    })
})
