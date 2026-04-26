import { mkdir, readFile, readdir, copyFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const desktopRoot = path.resolve('desktop')
const tauriConfigPath = path.join(desktopRoot, 'src-tauri', 'tauri.conf.json')
const bundleRoot = path.join(desktopRoot, 'src-tauri', 'target', 'release', 'bundle')
const outputDir = path.resolve(process.env.DESKTOP_UPDATE_OUTPUT_DIR ?? 'desktop-update')
const publicBaseUrl = (process.env.DESKTOP_UPDATE_PUBLIC_BASE_URL ?? 'https://app.login.no/api/desktop').replace(/\/$/, '')
const platform = process.env.TAURI_UPDATE_PLATFORM ?? detectPlatform()

const config = JSON.parse(await readFile(tauriConfigPath, 'utf8'))
const version = config.version
const productName = config.productName ?? 'Login Desktop'
const notes = process.env.DESKTOP_UPDATE_NOTES ?? `${productName} ${version}`
const pubDate = new Date().toISOString()

if (!version) {
    throw new Error(`Missing version in ${tauriConfigPath}`)
}

const artifacts = await findFiles(bundleRoot)
const updateBundle = artifacts.find((file) => file.endsWith('.tar.gz') && artifacts.includes(`${file}.sig`))

if (!updateBundle) {
    throw new Error(`No signed Tauri updater bundle found under ${bundleRoot}. Expected a .tar.gz file with a matching .sig file.`)
}

await mkdir(outputDir, { recursive: true })

const artifactName = path.basename(updateBundle)
const signatureName = `${artifactName}.sig`
const artifactDestination = path.join(outputDir, artifactName)
const signatureDestination = path.join(outputDir, signatureName)

await copyFile(updateBundle, artifactDestination)
await copyFile(`${updateBundle}.sig`, signatureDestination)

const signature = (await readFile(signatureDestination, 'utf8')).trim()
const manifestPath = path.join(outputDir, 'latest.json')
const previousManifest = await readJsonIfPresent(manifestPath)

const manifest = {
    version,
    notes,
    pub_date: pubDate,
    platforms: {
        ...(previousManifest?.platforms ?? {}),
        [platform]: {
            signature,
            url: `${publicBaseUrl}/download/${encodeURIComponent(artifactName)}`,
        },
    },
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Prepared ${platform} updater manifest for ${productName} ${version}`)
console.log(`Artifact: ${artifactDestination}`)
console.log(`Manifest: ${manifestPath}`)

async function findFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name)
        return entry.isDirectory() ? findFiles(fullPath) : fullPath
    }))

    return files.flat()
}

async function readJsonIfPresent(file) {
    try {
        return JSON.parse(await readFile(file, 'utf8'))
    } catch (error) {
        if (error?.code === 'ENOENT') {
            return null
        }
        throw error
    }
}

function detectPlatform() {
    const arch = process.arch === 'arm64' ? 'aarch64' : process.arch === 'x64' ? 'x86_64' : process.arch

    if (process.platform === 'darwin') {
        return `darwin-${arch}`
    }

    if (process.platform === 'win32') {
        return `windows-${arch}`
    }

    if (process.platform === 'linux') {
        return `linux-${arch}`
    }

    throw new Error(`Unsupported updater platform: ${process.platform}-${process.arch}`)
}
