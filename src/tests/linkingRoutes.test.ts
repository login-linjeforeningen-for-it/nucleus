jest.mock('expo-linking', () => ({
    createURL: jest.fn(() => 'exp+login://'),
}))

import { getStateFromPath, NavigationState, PartialState } from '@react-navigation/native'
import linking from '@utils/linking'

const expectedRoutes = [
    ['events/42', 'SpecificEventScreen'],
    ['career/3', 'SpecificAdScreen'],
    ['profile', 'ProfileScreen'],
    ['ai', 'AiScreen'],
    ['internal/ai', 'AiScreen'],
    ['search', 'SearchScreen'],
    ['s?s=abc', 'SearchScreen'],
    ['status', 'StatusScreen'],
    ['internal/monitoring', 'StatusScreen'],
    ['music', 'MusicScreen'],
    ['albums', 'AlbumsScreen'],
    ['albums/3', 'SpecificAlbumScreen'],
    ['internal/loadbalancing', 'LoadBalancingScreen'],
    ['internal/traffic', 'TrafficScreen'],
    ['internal/traffic/records', 'TrafficRecordsScreen'],
    ['internal/traffic/map', 'TrafficMapScreen'],
    ['internal/content', 'ContentScreen'],
    ['announcements', 'AnnouncementsScreen'],
    ['internal/announcements', 'AnnouncementsScreen'],
    ['internal/nucleus/documentation', 'NucleusDocumentationScreen'],
    ['nucleus/documentation', 'NucleusDocumentationScreen'],
    ['honey', 'HoneyScreen'],
    ['internal/db', 'DatabaseScreen'],
    ['internal/vulnerabilities', 'VulnerabilitiesScreen'],
    ['internal/logs', 'LogsScreen'],
] as const

describe('React Navigation deep-link routes', () => {
    it.each(expectedRoutes)('resolves %s to %s', (path: string, screen: string) => {
        const state = getStateFromPath(path, linking.config)
        expect(findRoute(state, screen)).toBe(true)
    })
})

function findRoute(
    state: NavigationState | PartialState<NavigationState> | undefined,
    routeName: string,
): boolean {
    if (!state?.routes) {
        return false
    }

    return state.routes.some((route) => route.name === routeName || findRoute(route.state as any, routeName))
}
