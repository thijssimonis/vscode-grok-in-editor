import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildActionPrompt } from './buildFixPrompt'

const sampleSource = ['function add(a, b) {', '  return a - b;', '}', '', 'export { add };'].join('\n')

describe('buildActionPrompt', () => {
    it('includes path, language, diagnostics, and numbered snippet', () => {
        const prompt = buildActionPrompt({
            action: 'fix',
            filePath: 'src/math.ts',
            languageId: 'typescript',
            source: sampleSource,
            diagnostics: [
                {
                    severity: 'error',
                    message: "Operator '-' should be '+'.",
                    startLine: 2,
                    startCharacter: 12,
                },
            ],
        })

        assert.match(prompt, /src\/math\.ts/)
        assert.match(prompt, /typescript/)
        assert.match(prompt, /error: Operator '-' should be '\+'/)
        assert.match(prompt, /2 \|   return a - b;/)
        assert.match(prompt, /Fix the problem/i)
        assert.doesNotMatch(prompt, /(^|\s)-p(\s|$)/)
        assert.doesNotMatch(prompt, /--single/)
    })

    it('uses the selection as the snippet when one is provided', () => {
        const prompt = buildActionPrompt({
            action: 'fix',
            filePath: 'src/math.ts',
            languageId: 'typescript',
            source: sampleSource,
            selection: { startLine: 2, startCharacter: 1, endLine: 2, endCharacter: 16 },
            diagnostics: [],
        })

        assert.match(prompt, /2 \|   return a - b;/)
        assert.doesNotMatch(prompt, /5 \| export \{ add \};/)
        assert.match(prompt, /review this file and fix problems/i)
    })

    it('windows the snippet around the first diagnostic when there is no selection', () => {
        const lines = Array.from({ length: 200 }, (_, i) => `line ${i + 1}`)
        const prompt = buildActionPrompt({
            action: 'fix',
            filePath: 'big.ts',
            languageId: 'typescript',
            source: lines.join('\n'),
            diagnostics: [
                {
                    severity: 'warning',
                    message: 'unused',
                    startLine: 100,
                    startCharacter: 1,
                },
            ],
        })

        assert.match(prompt, /100 \| line 100/)
        assert.doesNotMatch(prompt, /1 \| line 1\n/)
        assert.doesNotMatch(prompt, /200 \| line 200/)
    })

    it('truncates a huge snippet and says so', () => {
        const huge = 'x'.repeat(20_000)
        const prompt = buildActionPrompt({
            action: 'fix',
            filePath: 'huge.txt',
            languageId: 'plaintext',
            source: huge,
            diagnostics: [],
            maxSnippetChars: 100,
        })

        assert.match(prompt, /truncated/i)
        assert.ok(prompt.length < 2000)
    })

    it('asks Grok to explain the selected code without applying a fix', () => {
        const prompt = buildActionPrompt({
            action: 'explain',
            filePath: 'src/math.ts',
            languageId: 'typescript',
            source: sampleSource,
            selection: { startLine: 1, startCharacter: 1, endLine: 3, endCharacter: 2 },
            diagnostics: [],
        })

        assert.match(prompt, /Explain this code/i)
        assert.match(prompt, /src\/math\.ts/)
        assert.match(prompt, /purpose and functionality/i)
        assert.doesNotMatch(prompt, /Apply the fix/i)
        assert.doesNotMatch(prompt, /No editor diagnostics were attached/)
    })

    it('asks Grok to improve the selected code', () => {
        const prompt = buildActionPrompt({
            action: 'improve',
            filePath: 'src/math.ts',
            languageId: 'typescript',
            source: sampleSource,
            selection: { startLine: 1, startCharacter: 1, endLine: 3, endCharacter: 2 },
            diagnostics: [],
        })

        assert.match(prompt, /Improve this code/i)
        assert.match(prompt, /readability and maintainability/i)
        assert.match(prompt, /Apply the improvements/i)
        assert.doesNotMatch(prompt, /Fix the problem/i)
    })
})
