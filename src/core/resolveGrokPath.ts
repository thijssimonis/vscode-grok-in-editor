import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export type GrokPathSource = 'cliPath' | 'path' | 'home'

export type ResolveGrokPathInput = {
    cliPath?: string
    pathEnv?: string
    homeDir?: string
    platform?: NodeJS.Platform
    fileExists?: (candidate: string) => boolean
    pathJoin?: (...parts: string[]) => string
    pathDelimiter?: string
}

export type ResolveGrokPathResult = { ok: true; path: string; source: GrokPathSource } | { ok: false; tried: string[] }

export function resolveGrokPath(input: ResolveGrokPathInput = {}): ResolveGrokPathResult {
    const platform = input.platform ?? process.platform
    const join = input.pathJoin ?? (platform === 'win32' ? path.win32.join : path.posix.join)
    const delimiter = input.pathDelimiter ?? (platform === 'win32' ? ';' : ':')
    const exists = input.fileExists ?? (candidate => fs.existsSync(candidate))
    const homeDir = input.homeDir ?? os.homedir()
    const pathEnv = input.pathEnv ?? process.env.PATH ?? ''
    const binary = platform === 'win32' ? 'grok.exe' : 'grok'
    const tried: string[] = []

    const cliPath = input.cliPath?.trim()
    if (cliPath) {
        tried.push(cliPath)
        if (exists(cliPath)) {
            return { ok: true, path: cliPath, source: 'cliPath' }
        }
    }

    for (const dir of pathEnv.split(delimiter)) {
        if (!dir) {
            continue
        }
        const candidate = join(dir, binary)
        tried.push(candidate)
        if (exists(candidate)) {
            return { ok: true, path: candidate, source: 'path' }
        }
    }

    const homeGrok = join(homeDir, '.grok', 'bin', binary)
    tried.push(homeGrok)
    if (exists(homeGrok)) {
        return { ok: true, path: homeGrok, source: 'home' }
    }

    return { ok: false, tried }
}
