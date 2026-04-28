import config from '@/constants'
import * as FileSystem from 'expo-file-system/legacy'
import * as MediaLibrary from 'expo-media-library'
import { Platform } from 'react-native'

export type AlbumDownloadResult = {
    errors: string[]
    failed: string[]
    saved: string[]
}

type DownloadAlbumImagesProps = {
    albumId: number | string
    images: string[]
}

function albumImageUrl(albumId: number | string, image: string) {
    return `${config.cdn}/albums/${albumId}/${encodeURIComponent(image)}`
}

function safeFileName(image: string) {
    const clean = image.split('/').pop()?.replace(/[^\w.-]/g, '_') || `album-${Date.now()}.jpg`
    return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(clean) ? clean : `${clean}.jpg`
}

async function downloadOnWeb(url: string, image: string) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Download failed with ${response.status}`)
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = safeFileName(image)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
}

async function ensureMediaPermission() {
    const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo'])
    if (!permission.granted) {
        throw new Error('Photo library permission was denied')
    }
}

async function downloadOnDevice(url: string, image: string) {
    if (!FileSystem.cacheDirectory) {
        throw new Error('File cache is unavailable')
    }

    const destination = `${FileSystem.cacheDirectory}${Date.now()}-${safeFileName(image)}`
    const download = await FileSystem.downloadAsync(url, destination)
    if (download.status < 200 || download.status >= 300) {
        throw new Error(`Download failed with ${download.status}`)
    }

    await MediaLibrary.saveToLibraryAsync(download.uri)
}

export async function downloadAlbumImages({
    albumId,
    images,
}: DownloadAlbumImagesProps): Promise<AlbumDownloadResult> {
    const uniqueImages = Array.from(new Set(images)).filter(Boolean)
    if (!uniqueImages.length) {
        return { errors: [], failed: [], saved: [] }
    }

    if (Platform.OS !== 'web') {
        await ensureMediaPermission()
    }

    const result: AlbumDownloadResult = { errors: [], failed: [], saved: [] }
    for (const image of uniqueImages) {
        const url = albumImageUrl(albumId, image)
        try {
            if (Platform.OS === 'web') {
                await downloadOnWeb(url, image)
            } else {
                await downloadOnDevice(url, image)
            }
            result.saved.push(image)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown download error'
            console.warn(`Album download failed for ${image}: ${message}`)
            result.errors.push(`${image}: ${message}`)
            result.failed.push(image)
        }
    }

    return result
}
