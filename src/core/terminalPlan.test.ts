import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { planGrokTerminal } from './terminalPlan'

describe('terminalPlan', () => {
    it('opens a new Grok tab in the active editor group each time', () => {
        const plan = planGrokTerminal({
            mode: 'open',
            grokPath: '/Users/dev/.grok/bin/grok',
            cwd: '/proj',
            env: {
                HOME: '/Users/dev',
                PATH: '/usr/bin',
                VIRTUAL_ENV: '/proj/.venv',
            },
        })

        assert.equal(plan.name, 'Grok')
        assert.equal(plan.shellPath, '/Users/dev/.grok/bin/grok')
        assert.deepEqual(plan.shellArgs, [])
        assert.equal(plan.cwd, '/proj')
        assert.equal(plan.isTransient, true)
        assert.equal(plan.hideFromUser, true)
        assert.equal(plan.strictEnv, true)
        assert.equal(plan.env.HOME, '/Users/dev')
        assert.equal(plan.env.PATH, '/usr/bin')
        assert.equal('VIRTUAL_ENV' in plan.env, false)
        assert.deepEqual(plan.location, { viewColumn: 'Active', preserveFocus: false })
        assert.notEqual(plan.location.viewColumn, 'Panel')
    })

    it('opens a new action tab with extra args before the prompt', () => {
        const plan = planGrokTerminal({
            mode: 'action',
            grokPath: '/usr/bin/grok',
            cwd: '/proj',
            extraArgs: ['--minimal'],
            prompt: 'Fix the problem in src/a.ts',
            viewColumn: 'beside',
        })

        assert.equal(plan.name, 'Grok')
        assert.deepEqual(plan.shellArgs, ['--minimal', 'Fix the problem in src/a.ts'])
        assert.deepEqual(plan.location, { viewColumn: 'Beside', preserveFocus: false })
        assert.ok(!plan.shellArgs.includes('-p'))
        assert.ok(!plan.shellArgs.includes('--single'))
        assert.ok(!plan.shellArgs.includes('--always-approve'))
    })
})
