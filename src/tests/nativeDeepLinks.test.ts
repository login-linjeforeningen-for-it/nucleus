import getExpoConfig from '../../app.config'

const publicPaths = [
    '/events',
    '/career',
    '/profile',
    '/about',
    '/companies',
    '/ai',
    '/search',
    '/s',
    '/status',
    '/music',
    '/albums',
    '/fund',
    '/verv',
    '/policy',
    '/pwned',
]

describe('native deep-link configuration', () => {
    it('claims every public app route in the tracked Expo native config', () => {
        const config = getExpoConfig({
            config: {
                name: 'Login',
                slug: 'Login',
                ios: { buildNumber: '151' },
                android: { versionCode: 103 },
            },
        } as any)

        expect(config.ios?.associatedDomains).toEqual([
            'applinks:login.no',
            'applinks:www.login.no',
        ])

        const filters = config.android?.intentFilters || []
        const viewFilter = filters.find((filter) => filter.action === 'VIEW')
        expect(viewFilter?.autoVerify).toBe(true)

        for (const publicPath of publicPaths) {
            expect(viewFilter?.data).toEqual(expect.arrayContaining([
                expect.objectContaining({ scheme: 'https', host: 'login.no', pathPrefix: publicPath }),
                expect.objectContaining({ scheme: 'https', host: 'www.login.no', pathPrefix: publicPath }),
            ]))
        }
    })
})
