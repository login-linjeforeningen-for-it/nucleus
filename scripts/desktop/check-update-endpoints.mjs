import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const expectedBase = 'https://hanasand.com/api/app'
const stalePatterns = [
  'https://app.login.no/api/desktop',
  '/api/desktop',
]

const files = [
  'desktop/src/lib/appUpdate.ts',
  'desktop/src/main.tsx',
  'desktop/src-tauri/tauri.conf.json',
  'scripts/desktop/prepare-update-manifest.mjs',
  '.github/workflows/desktop-updates.yml',
]

const failures = []

for (const file of files) {
  const content = await readFile(path.join(repoRoot, file), 'utf8')
  for (const stale of stalePatterns) {
    if (content.includes(stale)) {
      failures.push(`${file} still references ${stale}`)
    }
  }

  if (!content.includes(expectedBase) && file !== 'desktop/src/main.tsx') {
    failures.push(`${file} does not reference ${expectedBase}`)
  }
}

if (failures.length) {
  throw new Error(`Desktop update endpoint check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
}

console.log(`Desktop update endpoints use ${expectedBase}`)
