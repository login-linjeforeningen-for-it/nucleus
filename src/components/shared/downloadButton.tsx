import MS from '@styles/menuStyles'
import { ImageSourcePropType, TouchableOpacity } from 'react-native'
import handleDownload from '@/utils/calendar'
import { Image } from 'react-native'
import { timeSince } from '@/utils/fetch'
import { useSelector, useDispatch } from 'react-redux'
import { setDownloadState } from '@redux/event'
import { useState } from 'react'

type DownloadButtonProps = {
    screen: 'event' | 'ad'
}

export default function DownloadButton({ screen }: DownloadButtonProps) {
    const { isDark } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { calendarID } = useSelector((state: ReduxState) => state.misc)
    const event = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const dark: ImageSourcePropType = require('@assets/icons/download.png')
    const light: ImageSourcePropType = require('@assets/icons/download-black.png')
    const orange: ImageSourcePropType = require('@assets/icons/download-orange.png')
    const [icon, setIcon] = useState<ImageSourcePropType>(isDark ? dark : light)
    const dispatch = useDispatch()
    const isEventScreen = screen === 'event'
    const clickedItems = isEventScreen ? event.clickedEvents : ad.clickedAds
    const downloadState = isEventScreen ? event.downloadState : ad.downloadState

    function flashOrange() {
        setIcon(orange)
        setTimeout(() => {
            setIcon(isDark ? dark : light)
        }, 500)
    }

    return (
        <>
            {clickedItems.length > 0 &&
                <TouchableOpacity
                    onPress={async () => {
                        if (timeSince(downloadState || 1000) >= 1000) {
                            flashOrange()
                            dispatch(setDownloadState())
                            await handleDownload({
                                items: clickedItems,
                                calendarID, dispatch, lang, isEventScreen
                            })
                        }
                    }}>
                    <Image style={MS.multiIcon} source={icon} />
                </TouchableOpacity>
            }
        </>
    )
}
