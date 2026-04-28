import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const strict = process.argv.includes('--strict')
const platformArg = process.argv.find((arg) => arg.startsWith('--platform='))
const platform = platformArg ? platformArg.split('=')[1] : 'all'
const failures = []

const requiredFiles = [
    'package.json',
    'app.config.ts',
    'Gemfile',
    'fastlane/Fastfile',
]

const iosEnv = [
    'ASC_KEY_ID',
    'ASC_ISSUER_ID',
    'ASC_PRIVATE_KEY_BASE64',
    'APPLE_TEAM_ID',
    'MACOS_KEYCHAIN_PASSWORD',
]

const androidEnv = [
    'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64',
    'ANDROID_KEYSTORE_BASE64',
    'ANDROID_KEYSTORE_PASSWORD',
    'ANDROID_KEY_ALIAS',
    'ANDROID_KEY_PASSWORD',
]

for (const file of requiredFiles) {
    if (!existsSync(file)) {
        failures.push(`Missing required file: ${file}`)
    }
}

if (existsSync('package.json')) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    if (!pkg.scripts?.test) {
        failures.push('package.json is missing a test script')
    }
}

if (strict) {
    const xcode = spawnSync('xcodebuild', ['-version'], { encoding: 'utf8' })
    if (xcode.status !== 0) {
        failures.push('Full Xcode is required on the Mac mini runner; xcodebuild -version failed')
    }

    const requiredEnv = [
        ...(platform === 'all' || platform === 'ios' ? iosEnv : []),
        ...(platform === 'all' || platform === 'android' ? androidEnv : []),
    ]

    for (const key of requiredEnv) {
        if (!process.env[key]) {
            failures.push(`Missing required CI secret/env: ${key}`)
        }
    }
}

if (failures.length) {
    console.error('Direct store release preflight failed:')
    for (const failure of failures) {
        console.error(`- ${failure}`)
    }
    process.exit(1)
}

console.log(`Direct store release preflight passed (${strict ? 'strict' : 'local'} mode, platform=${platform}).`)
