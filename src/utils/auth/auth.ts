import * as ExpoLinking from 'expo-linking'
import { Linking, Platform } from 'react-native'
import config from '@/constants'
import store from '@redux/store'
import { setSession } from '@redux/loginStatus'
import { setProfile } from '@redux/profile'

type AuthSession = {
    accessToken: string
    id: string
    name: string
    email: string
    groups: string[]
    target: string | null
}

export function parseAuthUrl(url: string): AuthSession | null {
    const parsed = ExpoLinking.parse(url)
    const queryParams = parsed.queryParams || {}
    const accessToken = typeof queryParams.access_token === 'string' ? queryParams.access_token : null
    const id = typeof queryParams.id === 'string' ? queryParams.id : null
    const name = typeof queryParams.name === 'string' ? queryParams.name : null
    const email = typeof queryParams.email === 'string' ? queryParams.email : null
    const groupsValue = typeof queryParams.groups === 'string' ? queryParams.groups : ''
    const target = typeof queryParams.target === 'string' ? queryParams.target : null

    if (!accessToken || !id || !name || !email) {
        return null
    }

    return {
        accessToken,
        id,
        name,
        email,
        groups: groupsValue.split(',').map(group => group.trim()).filter(Boolean),
        target
    }
}

function applyAuthSession(session: AuthSession) {
    store.dispatch(setSession({
        token: session.accessToken,
        groups: session.groups,
        target: session.target
    }))
    store.dispatch(setProfile({
        id: session.id,
        name: session.name,
        email: session.email,
        groups: session.groups,
    }))
}

export function handleAuthUrl(url: string) {
    const session = parseAuthUrl(url)
    if (!session) {
        return false
    }

    applyAuthSession(session)
    return true
}

export async function hydrateAuthFromInitialUrl() {
    const initialUrl = await ExpoLinking.getInitialURL()
    if (initialUrl) {
        handleAuthUrl(initialUrl)
    }
}

export function registerAuthListener() {
    return ExpoLinking.addEventListener('url', ({ url }) => {
        handleAuthUrl(url)
    })
}

function createNativeAuthRedirectUri() {
    if (Platform.OS !== 'web') {
        return 'login://auth'
    }

    const redirectUri = ExpoLinking.createURL('auth')
    return redirectUri.replace(/^exp\+([a-z][a-z0-9+.-]*:\/\/.*)$/i, '$1')
}

export async function startLogin(target = 'app') {
    const redirectUri = createNativeAuthRedirectUri()
    const loginUrl = `${config.app_api}/auth/login`
        + `?redirect_uri=${encodeURIComponent(redirectUri)}`
        + `&target=${encodeURIComponent(target)}`
    await Linking.openURL(loginUrl)
}

export async function openAuthenticatedDestination(destination: 'gpt' | 'queenbee' | 'internal') {
    const state = store.getState() as unknown as ReduxState
    const token = state.login.token
    if (!token) {
        await startLogin(destination)
        return
    }

    const url = destination === 'gpt'
        ? `${config.login}/api/auth/token`
            + `?access_token=${encodeURIComponent(token)}`
            + `&redirect=${encodeURIComponent('/ai')}`
        : `${config.queenbee}/api/auth/token`
            + `?access_token=${encodeURIComponent(token)}`
            + `&redirect=${encodeURIComponent('/internal')}`

    await Linking.openURL(url)
}
