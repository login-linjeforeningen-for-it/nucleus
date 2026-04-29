import config from '@/constants'
import { fetchAlbumDetails } from '@/utils/fetchers/publicContent'
import { Image } from 'react-native'

type QueueItem = {
    key: string
    priority: number
    run: () => Promise<unknown>
}

const PREVIEW_CACHE_TTL = 60 * 60 * 1000
const MAX_IN_FLIGHT = 2
const previewCache = new Map<string, number>()
const uriCache = new Map<string, number>()
const fullAlbumCache = new Map<number, number>()
const queuedKeys = new Set<string>()
const queuedUris = new Set<string>()
const queuedUriKeys = new Map<string, string>()
const queue: QueueItem[] = []
let inFlight = 0
let scheduled = false
let paused = false

export type AlbumImageVariant = 'original' | 'preview'

export function albumImageUri(albumId: number | string, image: string, variant: AlbumImageVariant = 'original') {
    const uri = `${config.cdn}/albums/${albumId}/${image}`
    if (variant === 'original') {
        return uri
    }

    return `${uri}?w=220&q=24`
}

export function getAlbumPreviewImages(album: GetAlbumProps, count: number) {
    return Array.isArray(album.images) ? album.images.slice(0, count) : []
}

export function prefetchAlbumPreview(album: GetAlbumProps, indexes: number[], priority = 5) {
    for (const index of indexes) {
        const image = getAlbumPreviewImages(album, index + 1)[index]
        if (image) {
            prefetchPreviewUri(albumImageUri(album.id, image, 'preview'), priority)
        }
    }
}

export function prefetchAlbum(album: GetAlbumProps, priority = 1, variant: AlbumImageVariant = 'preview') {
    const images = Array.isArray(album.images) ? album.images : []
    images.forEach((image, index) => {
        const uri = albumImageUri(album.id, image, variant)
        prefetchUri(uri, `album:${variant}:${album.id}:${image}`, priority + index / 1000)
    })
}

export function prioritizeAlbumImages(album: GetAlbumProps, priority = 0) {
    prefetchAlbum(album, priority)
    prefetchAlbumDetails(album.id, priority)
}

export function pauseAlbumImagePrefetch() {
    paused = true
}

export function resumeAlbumImagePrefetch() {
    if (!paused) {
        return
    }

    paused = false
    schedulePump()
}

export async function stageAlbumListImages({
    albums,
    visibleAlbumIds,
    onPreviewCount,
}: {
    albums: GetAlbumProps[]
    visibleAlbumIds: Set<number>
    onPreviewCount: (albumIds: number[], count: number) => void
}) {
    const fallbackVisibleIds = visibleAlbumIds.size
        ? visibleAlbumIds
        : new Set(albums.slice(0, 3).map((album) => album.id))
    const visibleAlbums = albums.filter((album) => fallbackVisibleIds.has(album.id))
    const restAlbums = albums.filter((album) => !fallbackVisibleIds.has(album.id))

    onPreviewCount(visibleAlbums.map((album) => album.id), 1)
    visibleAlbums.forEach((album) => prefetchAlbumPreview(album, [0], 1))
    await phaseDelay()

    visibleAlbums.forEach((album) => prefetchAlbumPreview(album, [1, 2], 2))
    onPreviewCount(visibleAlbums.map((album) => album.id), 3)
    await phaseDelay()

    restAlbums.forEach((album) => prefetchAlbumPreview(album, [0], 5))
    onPreviewCount(restAlbums.map((album) => album.id), 1)
    await phaseDelay()

    restAlbums.forEach((album) => prefetchAlbumPreview(album, [1, 2], 6))
    onPreviewCount(restAlbums.map((album) => album.id), 3)
    await phaseDelay()

    visibleAlbums.forEach((album) => prefetchAlbumDetails(album.id, 8))
}

function prefetchAlbumDetails(albumId: number, priority: number) {
    const lastPrefetch = fullAlbumCache.get(albumId)
    if (lastPrefetch && Date.now() - lastPrefetch < PREVIEW_CACHE_TTL) {
        return
    }

    enqueue(`details:${albumId}`, priority, async () => {
        const album = await fetchAlbumDetails(albumId)
        if (album) {
            prefetchAlbum(album, priority)
            fullAlbumCache.set(albumId, Date.now())
        }
    })
}

function prefetchPreviewUri(uri: string, priority: number) {
    const lastPrefetch = previewCache.get(uri)
    if (lastPrefetch && Date.now() - lastPrefetch < PREVIEW_CACHE_TTL) {
        return
    }

    prefetchUri(uri, `preview:${uri}`, priority, () => {
        previewCache.set(uri, Date.now())
    })
}

function prefetchUri(uri: string, key: string, priority: number, onSuccess?: () => void) {
    const lastPrefetch = uriCache.get(uri)
    if (lastPrefetch && Date.now() - lastPrefetch < PREVIEW_CACHE_TTL) {
        onSuccess?.()
        return
    }

    if (queuedUris.has(uri)) {
        reprioritizeQueuedUri(uri, priority)
        return
    }

    queuedUris.add(uri)
    queuedUriKeys.set(uri, key)
    enqueue(key, priority, async () => {
        await Image.prefetch(uri)
        uriCache.set(uri, Date.now())
        onSuccess?.()
    })
}

function enqueue(key: string, priority: number, run: () => Promise<unknown>) {
    if (queuedKeys.has(key)) {
        reprioritizeQueuedKey(key, priority)
        return
    }

    queuedKeys.add(key)
    queue.push({ key, priority, run })
    queue.sort((a, b) => a.priority - b.priority)
    schedulePump()
}

function reprioritizeQueuedKey(key: string, priority: number) {
    const item = queue.find((candidate) => candidate.key === key)
    if (!item || item.priority <= priority) {
        return
    }

    item.priority = priority
    queue.sort((a, b) => a.priority - b.priority)
    schedulePump()
}

function reprioritizeQueuedUri(uri: string, priority: number) {
    const queuedKey = queuedUriKeys.get(uri)
    if (!queuedKey) {
        return
    }

    const item = queue.find((candidate) => candidate.key === queuedKey)
    if (!item || item.priority <= priority) {
        return
    }

    item.priority = priority
    queue.sort((a, b) => a.priority - b.priority)
    schedulePump()
}

function schedulePump() {
    if (scheduled) {
        return
    }

    scheduled = true
    scheduleAfterFrame(() => {
        scheduled = false
        pumpQueue()
    })
}

function pumpQueue() {
    if (paused) {
        return
    }

    while (inFlight < MAX_IN_FLIGHT && queue.length) {
        const item = queue.shift()
        if (!item) {
            return
        }

        inFlight += 1
        item.run()
            .catch(() => undefined)
            .finally(() => {
                queuedKeys.delete(item.key)
                forgetQueuedUri(item.key)
                inFlight -= 1
                schedulePump()
            })
    }
}

function forgetQueuedUri(key: string) {
    if (key.startsWith('preview:')) {
        const uri = key.slice('preview:'.length)
        queuedUris.delete(uri)
        queuedUriKeys.delete(uri)
        return
    }

    const albumMatch = key.match(/^album:(original|preview):([^:]+):(.+)$/)
    if (albumMatch) {
        const uri = albumImageUri(albumMatch[2], albumMatch[3], albumMatch[1] as AlbumImageVariant)
        queuedUris.delete(uri)
        queuedUriKeys.delete(uri)
    }
}

function scheduleAfterFrame(task: () => void) {
    requestAnimationFrame(() => setTimeout(task, 0))
}

const phaseDelay = () => new Promise<void>((resolve) => {
    scheduleAfterFrame(resolve)
})
