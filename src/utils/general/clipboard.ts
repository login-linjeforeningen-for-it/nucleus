type ClipboardModule = {
    setString?: (value: string) => void
}

let clipboardModule: ClipboardModule | null | undefined

export function copyToClipboard(value: string) {
    try {
        if (clipboardModule === undefined) {
            clipboardModule = loadClipboardModule()
        }

        clipboardModule?.setString?.(value)
    } catch (error) {
        clipboardModule = null
        console.warn('Clipboard is unavailable in this native build.', error)
    }
}

function loadClipboardModule(): ClipboardModule | null {
    const module = require('@react-native-clipboard/clipboard') as {
        default?: ClipboardModule
    } & ClipboardModule

    return module.default || module || null
}
