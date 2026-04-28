import { existsSync, readFileSync } from 'node:fs'

const requiredFiles = [
    'package.json',
    'app.config.ts',
    'eas.json',
]

const requiredEnv = [
    'EXPO_TOKEN',
]

const strict = process.argv.includes('--strict')
const platformArg = process.argv.find((arg) => arg.startsWith('--platform='))
const platform = platformArg ? platformArg.split('=')[1] : 'all'
const failures = []

for (const file of requiredFiles) {
    if (!existsSync(file)) {
        failures.push(`Missing required file: ${file}`)
    }
}

if (existsSync('package.json')) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    if (!pkg.scripts?.build) {
        failures.push('package.json is missing the build script used by release automation')
    }
    if (!pkg.engines?.node) {
        failures.push('package.json is missing engines.node, so the runner may use the wrong Node version')
    }
}

if (existsSync('eas.json')) {
    const eas = JSON.parse(readFileSync('eas.json', 'utf8'))
    if (!eas.build?.production) {
        failures.push('eas.json is missing build.production')
    }
    if (eas.build?.production?.distribution !== 'store') {
        failures.push('eas.json build.production.distribution must be "store"')
    }
    if (!eas.submit?.production) {
        failures.push('eas.json is missing submit.production')
    }
    if (eas.submit?.production && !eas.submit.production.android && !eas.submit.production.ios) {
        failures.push('eas.json submit.production must configure android or ios')
    }
    if (eas.submit?.production?.android?.track !== 'internal') {
        failures.push('eas.json submit.production.android.track must be "internal"')
    }
    if (eas.submit?.production?.android && !eas.submit.production.android.serviceAccountKeyPath) {
        failures.push('eas.json submit.production.android.serviceAccountKeyPath must point at the Play service account file')
    }
    if (eas.submit?.production?.ios && !eas.submit.production.ios.ascAppId) {
        failures.push('eas.json submit.production.ios.ascAppId must target the App Store Connect app')
    }
}

if (strict) {
    const platformEnv = [
        ...requiredEnv,
        ...(platform === 'all' || platform === 'android' ? ['GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64'] : []),
    ]

    for (const key of platformEnv) {
        if (!process.env[key]) {
            failures.push(`Missing required CI secret/env: ${key}`)
        }
    }
}

if (failures.length) {
    console.error('Store release preflight failed:')
    for (const failure of failures) {
        console.error(`- ${failure}`)
    }
    process.exit(1)
}

console.log(`Store release preflight passed (${strict ? 'strict' : 'local'} mode, platform=${platform}).`)
