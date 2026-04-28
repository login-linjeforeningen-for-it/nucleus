import { Buffer } from 'node:buffer'
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

function writeBase64File(envName, path, mode = 0o600) {
    const value = process.env[envName]
    if (!value) {
        throw new Error(`${envName} is required`)
    }
    writeFileSync(path, Buffer.from(value, 'base64'))
    chmodSync(path, mode)
}

writeBase64File('GOOGLE_SERVICES_JSON_BASE64', 'google-services.json')
writeBase64File('GOOGLE_SERVICES_PLIST_BASE64', 'GoogleService-Info.plist')
writeBase64File('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64', 'google-play-service-account.json')

const ascDir = join(homedir(), '.appstoreconnect', 'private_keys')
mkdirSync(ascDir, { recursive: true })
writeBase64File('ASC_PRIVATE_KEY_BASE64', join(ascDir, `AuthKey_${process.env.ASC_KEY_ID}.p8`))

console.log('Direct store release credentials written to temporary CI paths.')
