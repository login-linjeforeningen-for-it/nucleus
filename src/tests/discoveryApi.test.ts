import {
    buildSearchAnimationLink,
    buildSearchEngineUrl,
    buildSpotifyUrl,
    decodeSearchAnimationToken,
    getSafeMusicActivity,
} from '@/utils/discovery/discoveryApi'

describe('discoveryApi music/search helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('normalizes Spotify image ids into full URLs', async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                stats: {},
                currentlyListening: [
                    {
                        id: 1,
                        type: 'track',
                        name: 'Song',
                        artist: 'Artist',
                        image: 'ab67616d0000b273abc',
                        song_id: 'track123',
                        artist_id: 'artist123',
                        album_id: 'album123',
                    }
                ]
            }),
        })) as any

        const data = await getSafeMusicActivity()
        expect(data.currentlyListening[0].image).toBe('https://i.scdn.co/image/ab67616d0000b273abc')
        expect(data.currentlyListening[0].song_id).toBe('track123')
    })

    it('builds direct engine and Spotify links', () => {
        expect(buildSearchEngineUrl('hello world', 'google')).toContain('google.com/search?q=hello%20world')
        expect(buildSpotifyUrl({
            id: 'episode-id',
            type: 'episode',
        } as any)).toBe('https://open.spotify.com/episode/episode-id')
        expect(buildSpotifyUrl({
            id: 1,
            type: 'track',
            song_id: 'track-id',
        } as any)).toBe('https://open.spotify.com/track/track-id')
    })

    it('round-trips search animation links for native deep links', () => {
        const link = buildSearchAnimationLink('søt robot', 'duckduckgo')
        const token = new URL(link).searchParams.get('s')

        expect(token).toBeTruthy()
        expect(decodeSearchAnimationToken(token || '')).toEqual({
            query: 'søt robot',
            engine: 'duckduckgo',
        })
        expect(decodeSearchAnimationToken('not-valid')).toBeNull()
    })
})
