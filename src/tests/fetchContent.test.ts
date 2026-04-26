import {
    fetchLocations,
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

    it('returns empty collections when endpoint shapes drift', async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({ result: 'unexpected' }),
        })) as any

        await expect(fetchRules()).resolves.toEqual({ rules: [], total_count: 0 })
        await expect(fetchLocations()).resolves.toEqual({ locations: [], total_count: 0 })
        await expect(fetchOrganizations()).resolves.toEqual({ organizations: [], total_count: 0 })
    })

    it('returns empty collections when requests fail', async () => {
        global.fetch = jest.fn(async () => ({
            ok: false,
            json: async () => ({}),
        })) as any

        await expect(fetchRules()).resolves.toEqual({ rules: [], total_count: 0 })
        await expect(fetchLocations()).resolves.toEqual({ locations: [], total_count: 0 })
        await expect(fetchOrganizations()).resolves.toEqual({ organizations: [], total_count: 0 })
    })
})
