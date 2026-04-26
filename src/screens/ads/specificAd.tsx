import { View, Dimensions, Text } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import Cluster from '@/components/shared/cluster'
import AS from '@styles/adStyles'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useState, useEffect, JSX } from 'react'
import Swipe from '@components/nav/swipe'
import Space from '@/components/shared/utils'
import T from '@styles/text'
import SpecificAdSections from '@/components/ads/specificAdSections'
import { setAdName } from '@redux/ad'
import { fetchAdDetails } from '@utils/fetch'
import { AdContext } from '@utils/contextProvider'

export default function SpecificAdScreen({ route: { params: { adID } } }: AdScreenProps<'SpecificAdScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [ad, setAd] = useState({} as GetJobProps)
    const [refresh, setRefresh] = useState(false)
    const [error, setError] = useState('')
    const dispatch = useDispatch()
    const height = Dimensions.get('window').height

    useEffect(() => {
        const adName = lang ? ad.title_no || ad.title_en
            : ad.title_en || ad.title_no
        dispatch(setAdName(adName))
    }, [ad])


    useEffect(() => {
        getDetails()
    }, [adID])


    async function getDetails() {
        const response = await fetchAdDetails(adID)

        if (response) {
            setAd(response)
            setError('')
            return true
        }

        setError('Failed to load job ad')
        return false
    }

    // Handels the refresh of the page
    const onRefresh = useCallback(async () => {
        setRefresh(true)
        const details = await getDetails()

        if (details) {
            setRefresh(false)
        }
    }, [refresh])

    return (
        <AdContext.Provider value={ad}>
            <Swipe left='AdScreen'>
                <View style={{ flex: 1, backgroundColor: theme.darker }}>
                    <ScrollView
                        style={AS.content}
                        contentContainerStyle={{
                            paddingTop: Dimensions.get('window').height / 9.7 + (height > 800 && height < 900 ? 15 : 0),
                            paddingBottom: 100
                        }}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={100}
                        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
                    >
                        {error ? (
                            <Cluster>
                                <View style={{ padding: 14 }}>
                                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text>
                                </View>
                            </Cluster>
                        ) : null}
                        {ad?.id ? <SpecificAdSections ad={ad} /> : null}
                        <Space height={22} />
                    </ScrollView>
                </View>
            </Swipe>
        </AdContext.Provider>
    )
}
