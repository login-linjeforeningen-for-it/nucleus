import * as ExpoLinking from 'expo-linking'
import { Linking } from 'react-native'
import config from '@/constants'
import store from '@redux/store'
import { setSession } from '@redux/loginStatus'
import { setID, setMail, setName } from '@redux/profile'

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
    store.dispatch(setID(session.id))
    store.dispatch(setName(session.name))
    store.dispatch(setMail(session.email))
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

export async function startLogin(target = 'app') {
    const redirectUri = ExpoLinking.createURL('auth')
    const loginUrl = `${config.app_api_url}/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}&target=${encodeURIComponent(target)}`
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
        ? `${config.login_url}/api/auth/token?access_token=${encodeURIComponent(token)}&redirect=${encodeURIComponent('/ai')}`
        : `${config.queenbee_url}/api/auth/token?access_token=${encodeURIComponent(token)}&redirect=${encodeURIComponent('/internal')}`

    await Linking.openURL(url)
}
