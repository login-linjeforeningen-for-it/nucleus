import DefaultBanner from "@components/event/defaultBanner"
import Skeleton from "@components/shared/skeleton"
import config from "@/constants"
import ES from "@styles/eventStyles"
import { Dimensions, Image, View } from "react-native"
import { SvgUri } from "react-native-svg"
import { useSelector } from "react-redux"
import { useContext, useEffect, useState } from "react"
import { EventContext } from "@utils/contextProvider"
import imageExists from "@utils/imageExists"

export default function SpecificEventImage() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [url, setUrl] = useState(event?.image_banner || '')

    useEffect(() => {
        setUrl(event?.image_banner || '');

        (async () => {
            const urlExists = await imageExists(url)
            if (!urlExists) {
                setUrl(event?.image_small || '')
            }
        })()
    }, [event])
    
    if (event) {
        if (url.includes(".svg")) {
            return (
                <SvgUri
                    style={{ alignSelf: "center", marginTop: 8 }}
                    width={(Dimensions.get("window").width) / 1.2}
                    height={Dimensions.get("window").width / 3}
                    uri={`${config.cdn}/events/${url}`}
                />
            )
        } else if (url.includes(".png")) {
            return <Image
                style={ES.specificEventImage}
                source={{ uri: `${config.cdn}/events/${url}` }}
            />
        } else {
            return (
                <DefaultBanner
                    category={event.category?.name_no || event.category?.name_en}
                    color={event.category?.color}
                    height={ES.specificEventImage.height as number}
                    borderRadius={18}
                />
            )
        }
    }

    return (
        <View style={{ backgroundColor: theme.darker }}>
            <Skeleton loading={true} height={150} noColor={true} />
        </View>
    )
}
