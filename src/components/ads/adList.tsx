import { useDispatch, useSelector } from "react-redux"
import AdCluster from "./adCluster"
import { ErrorMessage } from "@components/shared/utils"
import Space from "@/components/shared/utils"
import { JSX, useCallback, useState } from "react"
import LastFetch, { fetchAdDetails, fetchAds } from "@utils/fetch"
import { setAds, setLastFetch } from "@redux/ad"
import { RefreshControl, ScrollView } from "react-native-gesture-handler"
import getListOffset from "@utils/getListOffset"

/**
 * Displays the ad list
 */
export default function AdList(): JSX.Element {
    const { ads, search, renderedAds, skills, clickedAds } = useSelector((state: ReduxState) => state.ad)
    const [refresh, setRefresh] = useState(false)
    const dispatch = useDispatch()

    async function getDetails() {
        const ads = await fetchAds()
        if (ads.length) {
            const detailedAdPromises = ads.map(async (ad) => {
                const details = await fetchAdDetails(ad.id)
                return details
            })

            const detailedAds = await Promise.all(detailedAdPromises)

            dispatch(setAds(detailedAds))
            dispatch(setLastFetch(LastFetch()))
            return true
        }
    }

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        const details = await getDetails()

        if (details) {
            setRefresh(false)
        }
    }, [refresh])

    // Copies renderedEvents because it's read only
    let adList: GetJobProps[] = [...renderedAds]
    adList.sort((a, b) => (Number(b.highlight) - Number(a.highlight)))
    if (!renderedAds.length && !search) {
        return <ErrorMessage argument={!ads ? "wifi" : "nomatch"} screen="ad" />
    }

    const offset = getListOffset({ search, categories: skills, clickedEvents: clickedAds, ad: true })

    if (renderedAds.length > 0) {
        return (
            <>
                <ScrollView
                    style={{ paddingTop: offset }}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={100}
                >
                    <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    {adList.map((ad, index) => <AdCluster index={index} ad={ad} key={index} />)}
                    <Space height={offset} />
                </ScrollView>
            </>
        )
    }

    return <ErrorMessage argument={!ads ? "wifi" : "nomatch"} screen="ad" />
}
