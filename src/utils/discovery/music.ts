import config from '@/constants'
import { requestJson } from './request'

function normalizeSpotifyImage(image: unknown) {
    if (typeof image !== 'string' || !image.length) {
        return ''
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image
    }

    return `https://i.scdn.co/image/${image}`
}

function normalizeMusicRow(entry: any, fallbackType: NativeMusicRow['type'] = 'track'): NativeMusicRow {
    return {
        id: entry.id ?? entry.song_id ?? entry.album_id ?? entry.artist_id ?? entry.name,
        type: entry.type || fallbackType,
        name: entry.name || entry.song || entry.artist || entry.album || 'Unknown',
        artist: entry.artist || entry.show || '',
        album: entry.album || null,
        image: normalizeSpotifyImage(entry.image || entry.top_song_image),
        listens: Number(entry.listens || entry.total_listens || 0),
        song_id: typeof entry.song_id === 'string' ? entry.song_id : undefined,
        artist_id: typeof entry.artist_id === 'string' ? entry.artist_id : undefined,
        album_id: typeof entry.album_id === 'string' ? entry.album_id : undefined,
    }
}

export async function getSafeMusicActivity(): Promise<NativeMusicActivity> {
    const data = await requestJson<any>(`${config.tekkom_bot_api}/activity`)
    return {
        stats: data.stats || {
            avg_seconds: 0,
            total_minutes: 0,
            total_minutes_this_year: 0,
            total_songs: 0,
        },
        currentlyListening: Array.isArray(data.currentlyListening)
            ? data.currentlyListening.map((entry: any) => normalizeMusicRow(entry, entry.type || 'track'))
            : [],
        topFiveToday: Array.isArray(data.topFiveToday)
            ? data.topFiveToday.map((entry: any) => normalizeMusicRow(entry))
            : [],
        topFiveThisWeek: Array.isArray(data.topFiveThisWeek)
            ? data.topFiveThisWeek.map((entry: any) => normalizeMusicRow(entry))
            : [],
        topFiveThisMonth: Array.isArray(data.topFiveThisMonth)
            ? data.topFiveThisMonth.map((entry: any) => normalizeMusicRow(entry))
            : [],
    }
}

export function buildSpotifyUrl(item: Pick<NativeMusicRow, 'type' | 'song_id' | 'artist_id' | 'album_id' | 'id'>) {
    if (item.type === 'episode') {
        return typeof item.id === 'string'
            ? `https://open.spotify.com/episode/${item.id}`
            : null
    }

    if (item.song_id) {
        return `https://open.spotify.com/track/${item.song_id}`
    }

    if (item.album_id) {
        return `https://open.spotify.com/album/${item.album_id}`
    }

    if (item.artist_id) {
        return `https://open.spotify.com/artist/${item.artist_id}`
    }

    return null
}
