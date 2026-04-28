import { Buffer } from 'node:buffer'
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const platformArg = process.argv.find((arg) => arg.startsWith('--platform='))
const platform = platformArg ? platformArg.split('=')[1] : 'all'

function writeBase64File(envName, path, mode = 0o600) {
    const value = process.env[envName]
    if (!value) {
        throw new Error(`${envName} is required`)
    }
    writeFileSync(path, Buffer.from(value, 'base64'))
    chmodSync(path, mode)
}

if (platform === 'all' || platform === 'android') {
    writeBase64File('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64', 'google-play-service-account.json')
}

if (platform === 'all' || platform === 'ios') {
    const ascDir = join(homedir(), '.appstoreconnect', 'private_keys')
    mkdirSync(ascDir, { recursive: true })
    writeBase64File('ASC_PRIVATE_KEY_BASE64', join(ascDir, `AuthKey_${process.env.ASC_KEY_ID}.p8`))
}

console.log(`Direct store release credentials written to temporary CI paths (platform=${platform}).`)
