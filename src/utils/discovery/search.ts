import config from '@/constants'
import { parseResponseBody, toRecord } from '@utils/http'

type SearchEngine = 'google' | 'duckduckgo' | 'brave'

export function buildSearchAnimationLink(query: string, engine: SearchEngine) {
    const payload = JSON.stringify({ query, engine })
    const token = encodeBase64Url(payload)

    return `${config.login}/s?s=${token}&play=1`
}

export function decodeSearchAnimationToken(token: string): { query: string; engine: SearchEngine } | null {
    try {
        const parsed = toRecord(parseResponseBody(decodeBase64Url(token)))
        if (!parsed) {
            return null
        }

        const query = typeof parsed.query === 'string' ? parsed.query.trim() : ''

        if (!query) {
            return null
        }

        return {
            query,
            engine: normalizeSearchEngine(parsed.engine),
        }
    } catch {
        return null
    }
}

export function buildSearchEngineUrl(query: string, engine: SearchEngine) {
    const encodedQuery = encodeURIComponent(query)

    switch (engine) {
        case 'duckduckgo':
            return `https://duckduckgo.com/?q=${encodedQuery}`
        case 'google':
            return `https://www.google.com/search?q=${encodedQuery}`
        default:
            return `https://search.brave.com/search?q=${encodedQuery}`
    }
}

function normalizeSearchEngine(value: unknown): SearchEngine {
    return value === 'google' || value === 'duckduckgo' || value === 'brave' ? value : 'google'
}

function encodeBase64Url(value: string) {
    const bytes = utf8ToBytes(value)
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let encoded = ''

    for (let index = 0; index < bytes.length; index += 3) {
        const first = bytes[index]
        const second = bytes[index + 1]
        const third = bytes[index + 2]
        const combined = (first << 16) | ((second || 0) << 8) | (third || 0)

        encoded += alphabet[(combined >> 18) & 63]
        encoded += alphabet[(combined >> 12) & 63]
        encoded += index + 1 < bytes.length ? alphabet[(combined >> 6) & 63] : '='
        encoded += index + 2 < bytes.length ? alphabet[combined & 63] : '='
    }

    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value: string) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    const bytes: number[] = []

    for (let index = 0; index < padded.length; index += 4) {
        const first = alphabet.indexOf(padded[index])
        const second = alphabet.indexOf(padded[index + 1])
        const third = padded[index + 2] === '=' ? -1 : alphabet.indexOf(padded[index + 2])
        const fourth = padded[index + 3] === '=' ? -1 : alphabet.indexOf(padded[index + 3])

        if (first < 0 || second < 0 || (third < 0 && padded[index + 2] !== '=') || (fourth < 0 && padded[index + 3] !== '=')) {
            throw new Error('Invalid base64url token')
        }

        const combined = (first << 18) | (second << 12) | ((third > -1 ? third : 0) << 6) | (fourth > -1 ? fourth : 0)
        bytes.push((combined >> 16) & 255)

        if (third > -1) {
            bytes.push((combined >> 8) & 255)
        }

        if (fourth > -1) {
            bytes.push(combined & 255)
        }
    }

    return bytesToUtf8(bytes)
}

function utf8ToBytes(value: string) {
    return Array.from(unescape(encodeURIComponent(value)), (character) => character.charCodeAt(0))
}

function bytesToUtf8(bytes: number[]) {
    return decodeURIComponent(escape(String.fromCharCode(...bytes)))
}
