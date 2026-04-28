import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const requiredEnv = [
    'ANDROID_KEYSTORE_BASE64',
    'ANDROID_KEYSTORE_PASSWORD',
    'ANDROID_KEY_ALIAS',
    'ANDROID_KEY_PASSWORD',
]

const missing = requiredEnv.filter((key) => !process.env[key])
if (missing.length) {
    console.error(`Missing Android signing env: ${missing.join(', ')}`)
    process.exit(1)
}

const keystorePath = 'android/app/upload-keystore.jks'
mkdirSync(dirname(keystorePath), { recursive: true })
writeFileSync(keystorePath, Buffer.from(process.env.ANDROID_KEYSTORE_BASE64, 'base64'))

const gradlePath = 'android/app/build.gradle'
let gradle = readFileSync(gradlePath, 'utf8')

if (!gradle.includes('upload {')) {
    const withUploadConfig = gradle.replace(
        /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n\s{8}\})\n(\s{4}\})/,
        (_, debugSigningBlock, signingConfigsClose) => `${debugSigningBlock}
        upload {
            storeFile file('upload-keystore.jks')
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
        }
${signingConfigsClose}`
    )

    if (withUploadConfig === gradle) {
        console.error('Could not find android signingConfigs block to add upload signing.')
        process.exit(1)
    }

    gradle = withUploadConfig
}

const withReleaseSigning = gradle.replace(
    /(release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
    '$1signingConfig signingConfigs.upload'
)

if (withReleaseSigning === gradle || !withReleaseSigning.includes('signingConfig signingConfigs.upload')) {
    console.error('Could not configure Android release signing.')
    process.exit(1)
}

writeFileSync(gradlePath, withReleaseSigning)
console.log('Android release signing configured.')
