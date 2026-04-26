import {
    fetchAnnouncements,
    fetchLocations,
    fetchHoneyList,
    fetchHoneyServices,
    fetchOrganizations,
    fetchRules,
} from '@utils/fetch'

describe('Workerbee content fetch helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('normalizes rules, locations, and organizations payloads', async () => {
        global.fetch = jest.fn(async (url: string) => ({
            ok: true,
            json: async () => {
                if (url.includes('/rules')) {
                    return {
                        rules: [{ id: 1, name_en: 'Rules' }],
                        total_count: 1,
                    }
                }
                if (url.includes('/locations')) {
                    return {
                        locations: [{ id: 2, name_en: 'Lounge', type: 'mazemap' }],
                        total_count: 1,
                    }
                }
                return {
                    organizations: [{ id: 3, name_en: 'Login', logo: 'login.png' }],
                    total_count: 1,
                }
            },
        })) as any

        await expect(fetchRules()).resolves.toEqual({
            rules: [{ id: 1, name_en: 'Rules' }],
            total_count: 1,
        })
        await expect(fetchLocations()).resolves.toEqual({
            locations: [{ id: 2, name_en: 'Lounge', type: 'mazemap' }],
            total_count: 1,
        })
        await expect(fetchOrganizations()).resolves.toEqual({
            organizations: [{ id: 3, name_en: 'Login', logo: 'login.png' }],
            total_count: 1,
        })
    })

    it('normalizes honey services and honey list payloads', async () => {
        global.fetch = jest.fn(async (url: string) => ({
            ok: true,
            json: async () => {
                if (url.endsWith('/text')) {
                    return ['beehive', 42, null]
                }

                return {
                    honeys: [{ id: 4, page: '/companies', language: 'en' }],
                    total_count: 1,
                }
            },
        })) as any

        await expect(fetchHoneyServices()).resolves.toEqual(['beehive'])
        await expect(fetchHoneyList('beehive')).resolves.toEqual({
            honeys: [{ id: 4, page: '/companies', language: 'en' }],
            total_count: 1,
        })
    })

    it('normalizes bot announcement array payloads', async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ([
                {
                    id: 9,
                    title: ['TekKom Mote'],
                    channel: '1032029092448575498',
                    total_count: '12',
                },
            ]),
        })) as any

        await expect(fetchAnnouncements()).resolves.toEqual({
            announcements: [{
                id: 9,
                title: ['TekKom Mote'],
                channel: '1032029092448575498',
                total_count: '12',
            }],
            total_count: 12,
        })
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/announcements?'),
            expect.objectContaining({ headers: { btg: 'tekkom-bot' } }),
        )
    })

    it('returns empty collections when endpoint shapes drift', async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({ result: 'unexpected' }),
        })) as any

        await expect(fetchRules()).resolves.toEqual({ rules: [], total_count: 0 })
        await expect(fetchLocations()).resolves.toEqual({ locations: [], total_count: 0 })
        await expect(fetchOrganizations()).resolves.toEqual({ organizations: [], total_count: 0 })
        await expect(fetchAnnouncements()).resolves.toEqual({ announcements: [], total_count: 0 })
    })

    it('returns empty collections when requests fail', async () => {
        global.fetch = jest.fn(async () => ({
            ok: false,
            json: async () => ({}),
        })) as any

        await expect(fetchRules()).resolves.toEqual({ rules: [], total_count: 0 })
        await expect(fetchLocations()).resolves.toEqual({ locations: [], total_count: 0 })
        await expect(fetchOrganizations()).resolves.toEqual({ organizations: [], total_count: 0 })
        await expect(fetchHoneyServices()).resolves.toEqual([])
        await expect(fetchHoneyList('beehive')).resolves.toEqual({ honeys: [], total_count: 0 })
        await expect(fetchAnnouncements()).resolves.toEqual({ announcements: [], total_count: 0 })
    })
})
