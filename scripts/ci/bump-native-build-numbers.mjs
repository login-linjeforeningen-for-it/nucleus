import fs from 'node:fs'

const appJsonPath = 'app.json'
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))

if (!appJson.expo || typeof appJson.expo !== 'object') {
  throw new Error('app.json is missing the expo config object')
}

const expo = appJson.expo
expo.ios = expo.ios && typeof expo.ios === 'object' ? expo.ios : {}
expo.android = expo.android && typeof expo.android === 'object' ? expo.android : {}

const currentIosBuildNumber = Number.parseInt(String(expo.ios.buildNumber ?? '0'), 10)
const currentAndroidVersionCode = Number(expo.android.versionCode ?? 0)

if (!Number.isSafeInteger(currentIosBuildNumber) || currentIosBuildNumber < 0) {
  throw new Error(`Invalid iOS buildNumber: ${expo.ios.buildNumber}`)
}

if (!Number.isSafeInteger(currentAndroidVersionCode) || currentAndroidVersionCode < 0) {
  throw new Error(`Invalid Android versionCode: ${expo.android.versionCode}`)
}

const nextIosBuildNumber = currentIosBuildNumber + 1
const nextAndroidVersionCode = currentAndroidVersionCode + 1

expo.ios.buildNumber = String(nextIosBuildNumber)
expo.android.versionCode = nextAndroidVersionCode

fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`)

console.log(`iOS buildNumber: ${currentIosBuildNumber} -> ${nextIosBuildNumber}`)
console.log(`Android versionCode: ${currentAndroidVersionCode} -> ${nextAndroidVersionCode}`)
