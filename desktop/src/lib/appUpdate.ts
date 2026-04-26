export type AppUpdateManifest = {
  version: string
  notes?: string
  pub_date?: string
  platforms?: Record<string, {
    signature: string
    url: string
  }>
}

export type AutoUpdateState =
  | { status: 'checking'; message: string; manifest: null }
  | { status: 'current'; message: string; manifest: AppUpdateManifest | null }
  | { status: 'available'; message: string; manifest: AppUpdateManifest }
  | { status: 'error'; message: string; manifest: AppUpdateManifest | null }

export const DESKTOP_APP_VERSION = '0.1.1'

const APP_UPDATE_API = import.meta.env.VITE_LOGIN_DESKTOP_UPDATE_API ?? `https://app.login.no/api/desktop/darwin-aarch64/${DESKTOP_APP_VERSION}`

export async function fetchAppUpdateManifest() {
  const response = await fetch(APP_UPDATE_API, {
    headers: { Accept: 'application/json' },
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Unable to check for Login Desktop updates.')
  }

  return data as AppUpdateManifest | null
}

export function hasNewerDesktopVersion(manifest: AppUpdateManifest | null) {
  if (!manifest) {
    return false
  }

  return compareVersions(manifest.version, DESKTOP_APP_VERSION) > 0
}

function compareVersions(candidate: string, current: string) {
  const candidateParts = parseVersion(candidate)
  const currentParts = parseVersion(current)
  const length = Math.max(candidateParts.length, currentParts.length)

  for (let index = 0; index < length; index += 1) {
    const candidatePart = candidateParts[index] ?? 0
    const currentPart = currentParts[index] ?? 0

    if (candidatePart !== currentPart) {
      return candidatePart - currentPart
    }
  }

  return 0
}

function parseVersion(version: string) {
  return version
    .replace(/^v/, '')
    .split(/[.-]/)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part))
}
