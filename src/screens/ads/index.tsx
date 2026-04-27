import AdList from '@components/ads/adList'
import DownloadButton from '@components/shared/downloadButton'
import GS from '@styles/globalStyles'
import LastFetch, { fetchAds } from '@/utils/fetch'
import LogoNavigation from '@/components/shared/logoNavigation'
import React, { JSX, useEffect } from 'react'
import Swipe from '@components/nav/swipe'
import { FilterButton, FilterUI } from '@components/shared/filter'
import { StatusBar } from 'expo-status-bar'
import { setAds, setLastFetch, setLastSave } from '@redux/ad'
import { useFocusEffect } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'

/**
 * Parent AdScreen component
 *
 * Handles:
 * - Displaying ads
 * - Filtering ads
 * - Notification Management
 * - Ad notifications, both scheduling and cancelling
 *
 * @param {navigation} Navigation Navigation route
 * @returns AdScreen
 */
export default function AdScreen({ navigation }: AdScreenProps<'AdScreen'>): JSX.Element {
    // Redux states
    const { clickedAds, search, lastSave, skills } = useSelector((state: ReduxState) => state.ad)
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const ads = useSelector((state: ReduxState) => state.ad.ads)
    const dispatch = useDispatch()

    // Fetches ads when screen is focused
    useFocusEffect(
        // Callback to avoid too many rerenders
        React.useCallback(() => {
            // Function to fetch clicked ads
            (async () => {
                const ads = await fetchAds()

                if (ads.length) {
                    dispatch(setAds(ads))
                    dispatch(setLastFetch(LastFetch()))
                }
            })()
        }, [])
    )

    // Loads initial data
    useEffect(() => {
        // IIFE to fetch API
        (async () => {
            const ads = await fetchAds()

            if (ads.length) {
                dispatch(setAds(ads))
                dispatch(setLastFetch(LastFetch()))
            }
        })()
    }, [])

    // Fetches API and updates cache every 10 seconds
    useEffect(() => {
        let interval: Interval = 0

        // Only when filter is closed to prevent "no match" issue
        if (!search) {
            interval = setInterval(() => {
                (async () => {
                    const ads = await fetchAds()

                    if (ads.length) {
                        dispatch(setAds(ads))
                        dispatch(setLastFetch(LastFetch()))
                    }
                })()
            }, 10000)
        } else {
            clearInterval(interval)
        }

        return () => clearInterval(interval)
    }, [search])

    useEffect(() => {
        if (lastSave === '') {
            (async () => { dispatch(setLastSave(LastFetch())) })()
        }
    }, [lastSave])

    // Sets the component of the header
    useEffect(() => {
        const right = ads.length ? [
            skills.length ? <FilterButton /> : null,
            clickedAds.length ? <DownloadButton screen='ad' /> : null,
        ] : []

        navigation.setOptions({
            headerComponents: {
                bottom: [<FilterUI />],
                left: [<LogoNavigation />],
                right
            }
        } as any)
    }, [ads.length, clickedAds.length, navigation, skills.length])

    return (
        <Swipe left='EventNav' right='MenuNav'>
            <View>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <View style={{
                    ...GS.content,
                    paddingHorizontal: 5,
                    backgroundColor: theme.darker
                }}>
                    <AdList />
                </View>
            </View>
        </Swipe>
    )
}
