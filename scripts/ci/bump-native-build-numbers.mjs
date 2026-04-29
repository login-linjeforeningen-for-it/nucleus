import fs from 'node:fs'

const appJsonPath = 'app.json'
const appConfigPath = 'app.config.ts'
const packageJsonPath = 'package.json'
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

if (!appJson.expo || typeof appJson.expo !== 'object') {
  throw new Error('app.json is missing the expo config object')
}

const expo = appJson.expo
expo.ios = expo.ios && typeof expo.ios === 'object' ? expo.ios : {}
expo.android = expo.android && typeof expo.android === 'object' ? expo.android : {}

const currentIosBuildNumber = Number.parseInt(String(expo.ios.buildNumber ?? '0'), 10)
const currentAndroidVersionCode = Number(expo.android.versionCode ?? 0)
const currentVersion = String(expo.version ?? packageJson.version ?? '')
const appConfig = fs.readFileSync(appConfigPath, 'utf8')
const appConfigVersionMatch = appConfig.match(/version:\s*['"](\d+\.\d+\.\d+)['"]/)

if (!Number.isSafeInteger(currentIosBuildNumber) || currentIosBuildNumber < 0) {
  throw new Error(`Invalid iOS buildNumber: ${expo.ios.buildNumber}`)
}

if (!Number.isSafeInteger(currentAndroidVersionCode) || currentAndroidVersionCode < 0) {
  throw new Error(`Invalid Android versionCode: ${expo.android.versionCode}`)
}

if (!appConfigVersionMatch) {
  throw new Error('Could not find the version field in app.config.ts')
}

const appConfigVersion = appConfigVersionMatch[1]

if (currentVersion !== packageJson.version || currentVersion !== appConfigVersion) {
  throw new Error(
    `Version mismatch before bump: app.json=${currentVersion}, package.json=${packageJson.version}, app.config.ts=${appConfigVersion}`,
  )
}

const versionMatch = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/)

if (!versionMatch) {
  throw new Error(`Invalid semver version: ${currentVersion}`)
}

const nextIosBuildNumber = currentIosBuildNumber + 1
const nextAndroidVersionCode = currentAndroidVersionCode + 1
const nextVersion = `${versionMatch[1]}.${Number(versionMatch[2]) + 1}.0`

expo.version = nextVersion
expo.ios.buildNumber = String(nextIosBuildNumber)
expo.android.versionCode = nextAndroidVersionCode
packageJson.version = nextVersion

fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`)
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

const nextAppConfig = appConfig.replace(
  /version:\s*['"]\d+\.\d+\.\d+['"]/,
  `version: '${nextVersion}'`,
)

if (nextAppConfig === appConfig) {
  throw new Error('Could not find the version field in app.config.ts')
}

fs.writeFileSync(appConfigPath, nextAppConfig)

console.log(`Version: ${currentVersion} -> ${nextVersion}`)
console.log(`iOS buildNumber: ${currentIosBuildNumber} -> ${nextIosBuildNumber}`)
console.log(`Android versionCode: ${currentAndroidVersionCode} -> ${nextAndroidVersionCode}`)
