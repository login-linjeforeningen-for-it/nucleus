jest.mock('expo-linking', () => ({
    parse: jest.fn(),
    getInitialURL: jest.fn(),
    addEventListener: jest.fn(),
    createURL: jest.fn(() => 'exp+login://auth'),
}))

jest.mock('react-native', () => ({
    Linking: {
        openURL: jest.fn(),
    }
}))

const dispatch = jest.fn()

jest.mock('@redux/store', () => ({
    __esModule: true,
    default: {
        dispatch,
        getState: jest.fn(() => ({
            login: {
                token: 'existing-token',
            }
        })),
    }
}))

jest.mock('@redux/loginStatus', () => ({
    setSession: jest.fn((payload: unknown) => ({
        type: 'login/setSession',
        payload,
    })),
}))

jest.mock('@redux/profile', () => ({
    setID: jest.fn((payload: unknown) => ({
        type: 'profile/setID',
        payload,
    })),
    setName: jest.fn((payload: unknown) => ({
        type: 'profile/setName',
        payload,
    })),
    setMail: jest.fn((payload: unknown) => ({
        type: 'profile/setMail',
        payload,
    })),
}))

import * as ExpoLinking from 'expo-linking'
import { Linking } from 'react-native'
import { handleAuthUrl, openAuthenticatedDestination, parseAuthUrl, startLogin } from '@/utils/auth'

describe('auth deep-link flow', () => {
    beforeEach(() => {
        dispatch.mockClear()
        jest.clearAllMocks()
    })

    it('parses a valid auth callback', () => {
        ;(ExpoLinking.parse as any).mockReturnValue({
            queryParams: {
                access_token: 'token-123',
                id: '42',
                name: 'Eirik',
                email: 'eirik@login.no',
                groups: 'queenbee, tekkom ,',
                target: 'gpt',
            }
        })

        expect(parseAuthUrl('login://auth?stub=1')).toEqual({
            accessToken: 'token-123',
            id: '42',
            name: 'Eirik',
            email: 'eirik@login.no',
            groups: ['queenbee', 'tekkom'],
            target: 'gpt',
        })
    })

    it('stores the session from a valid auth callback', () => {
        ;(ExpoLinking.parse as any).mockReturnValue({
            queryParams: {
                access_token: 'token-123',
                id: '42',
                name: 'Eirik',
                email: 'eirik@login.no',
                groups: 'queenbee,tekkom',
                target: 'internal',
            }
        })

        expect(handleAuthUrl('login://auth')).toBe(true)
        expect(dispatch).toHaveBeenCalledTimes(4)
        expect(dispatch).toHaveBeenNthCalledWith(1, {
            type: 'login/setSession',
            payload: {
                token: 'token-123',
                groups: ['queenbee', 'tekkom'],
                target: 'internal',
            }
        })
    })

    it('starts a native app login handoff', async () => {
        await startLogin('queenbee')

        expect(Linking.openURL).toHaveBeenCalledWith(
            'https://app.login.no/api/auth/login?redirect_uri=exp%2Blogin%3A%2F%2Fauth&target=queenbee'
        )
    })

    it('opens the in-app GPT token bridge when already signed in', async () => {
        await openAuthenticatedDestination('gpt')

        expect(Linking.openURL).toHaveBeenCalledWith(
            'https://login.no/api/auth/token?access_token=existing-token&redirect=%2Fai'
        )
    })
})
