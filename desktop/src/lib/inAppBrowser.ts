type BrowserTarget = {
  url: string
  title?: string
}

export async function openInAppBrowser(target: string | BrowserTarget) {
  const url = typeof target === 'string' ? target : target.url
  const title = typeof target === 'string' ? browserTitle(url) : target.title || browserTitle(target.url)
  const normalized = { url, title }

  if (window.loginOpenInAppBrowser) {
    window.loginOpenInAppBrowser(normalized)
    return
  }

  try {
    const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
    const label = `login-browser-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    new WebviewWindow(label, {
      url,
      title,
      width: 1280,
      height: 860,
      minWidth: 900,
      minHeight: 640,
      resizable: true,
      decorations: true,
      center: true,
      focus: true,
    })
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function browserTitle(url: string) {
  try {
    const parsed = new URL(url)
    return `Login Browser · ${parsed.hostname}`
  } catch {
    return 'Login Browser'
  }
}

declare global {
  interface Window {
    loginOpenInAppBrowser?: (target: BrowserTarget) => void
  }
}

export type { BrowserTarget }
