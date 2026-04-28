import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export const defaultPublicPinnedRoutes = ['SettingScreen', 'NotificationScreen', 'GameScreen', 'AiScreen']
export const defaultInternalPinnedRoutes = ['QueenbeeScreen']

export function usePinnedRoutes(storageKey: string, defaults: string[]) {
    const [pinnedRoutes, setPinnedRoutes] = useState<string[]>(defaults)

    useEffect(() => {
        let active = true

        AsyncStorage.getItem(storageKey)
            .then((stored) => {
                if (!active || !stored) {
                    return
                }

                const parsed = JSON.parse(stored)

                if (Array.isArray(parsed)) {
                    setPinnedRoutes(parsed.filter((route): route is string => typeof route === 'string'))
                }
            })
            .catch(() => undefined)

        return () => {
            active = false
        }
    }, [storageKey])

    function togglePinnedRoute(route: string) {
        setPinnedRoutes((current) => {
            const next = current.includes(route)
                ? current.filter((pinnedRoute) => pinnedRoute !== route)
                : [route, ...current]

            AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => undefined)

            return next
        })
    }

    return { pinnedRoutes, togglePinnedRoute }
}
