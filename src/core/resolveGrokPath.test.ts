import assert from 'node:assert/strict'
import path from 'node:path'
import { describe, it } from 'node:test'
import { resolveGrokPath } from './resolveGrokPath'

describe('resolveGrokPath', () => {
    it('uses cliPath when that file exists', () => {
        const result = resolveGrokPath({
            cliPath: '/opt/custom/grok',
            fileExists: p => p === '/opt/custom/grok',
            pathEnv: '',
            homeDir: '/home/dev',
            platform: 'darwin',
        })
        assert.deepEqual(result, { ok: true, path: '/opt/custom/grok', source: 'cliPath' })
    })

    it('skips a missing cliPath and finds grok on PATH', () => {
        const grokOnPath = path.join('/usr/local/bin', 'grok')
        const result = resolveGrokPath({
            cliPath: '/missing/grok',
            fileExists: p => p === grokOnPath,
            pathEnv: '/usr/local/bin:/usr/bin',
            homeDir: '/home/dev',
            platform: 'linux',
        })
        assert.deepEqual(result, { ok: true, path: grokOnPath, source: 'path' })
    })

    it('falls back to ~/.grok/bin/grok when PATH has no grok', () => {
        const homeGrok = path.join('/home/dev', '.grok', 'bin', 'grok')
        const result = resolveGrokPath({
            fileExists: p => p === homeGrok,
            pathEnv: '/usr/bin',
            homeDir: '/home/dev',
            platform: 'darwin',
        })
        assert.deepEqual(result, { ok: true, path: homeGrok, source: 'home' })
    })

    it('looks for grok.exe on Windows', () => {
        const homeGrok = path.win32.join('C:\\Users\\dev', '.grok', 'bin', 'grok.exe')
        const result = resolveGrokPath({
            fileExists: p => p === homeGrok,
            pathEnv: 'C:\\Windows\\System32',
            homeDir: 'C:\\Users\\dev',
            platform: 'win32',
            pathJoin: path.win32.join,
            pathDelimiter: ';',
        })
        assert.deepEqual(result, { ok: true, path: homeGrok, source: 'home' })
    })

    it('returns not found with the paths it tried', () => {
        const result = resolveGrokPath({
            cliPath: '  ',
            fileExists: () => false,
            pathEnv: '/usr/bin',
            homeDir: '/home/dev',
            platform: 'darwin',
        })
        assert.equal(result.ok, false)
        if (!result.ok) {
            assert.ok(result.tried.includes(path.join('/usr/bin', 'grok')))
            assert.ok(result.tried.includes(path.join('/home/dev', '.grok', 'bin', 'grok')))
        }
    })
})
