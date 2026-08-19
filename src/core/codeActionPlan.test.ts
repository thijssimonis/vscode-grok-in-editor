import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { planCodeActions } from './codeActionPlan'

describe('codeActionPlan', () => {
    it('offers Fix with Grok as a non-preferred Quick Fix when diagnostics exist', () => {
        const actions = planCodeActions([{ severity: 'error', message: 'boom', startLine: 1, startCharacter: 1 }])
        assert.deepEqual(actions, [
            {
                title: 'Fix with Grok',
                kind: 'quickfix',
                isPreferred: false,
                command: 'grok.fixWithGrok',
            },
        ])
    })

    it('offers Explain and Improve when there are no diagnostics', () => {
        assert.deepEqual(planCodeActions([]), [
            {
                title: 'Explain with Grok',
                kind: 'quickfix',
                isPreferred: false,
                command: 'grok.explainCode',
            },
            {
                title: 'Improve with Grok',
                kind: 'quickfix',
                isPreferred: false,
                command: 'grok.improveCode',
            },
        ])
    })
})
