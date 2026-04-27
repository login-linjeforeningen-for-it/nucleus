import Cluster from '@components/shared/cluster'
import CategorySquare from '@components/shared/category'
import DefaultBanner from '@components/event/defaultBanner'
import T from '@styles/text'
import { Dimensions, Image, Text, View } from 'react-native'
import { SvgUri } from 'react-native-svg'
import { useSelector } from 'react-redux'
import { formatEventTimeRange, resolveEventImageUrl } from './specificEventUtils'

export default function SpecificEventHero({ event }: { event: GetEventProps }) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const title = lang ? event.name_no || event.name_en : event.name_en || event.name_no
    const subtitle = formatEventTimeRange(event.time_start, event.time_end, lang)
    const bannerUrl = resolveEventImageUrl(event.image_banner || event.image_small)
    const width = Dimensions.get('window').width - 24
    const startDate = new Date(event.time_start)
    const endDate = event.time_type === 'default' ? new Date(event.time_end) : undefined

    return (
        <Cluster marginHorizontal={0}>
            <View style={{ padding: 14 }}>
                <BannerMedia
                    bannerUrl={bannerUrl}
                    width={width}
                    event={event}
                />
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <CategorySquare
                        color={event.category?.color}
                        startDate={startDate}
                        endDate={endDate}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ ...T.text20, color: theme.textColor, fontWeight: '700', marginBottom: 4 }}>
                            {title}
                        </Text>
                        <Text style={{ ...T.text12, color: theme.orange }}>
                            {subtitle}
                        </Text>
                    </View>
                </View>
            </View>
        </Cluster>
    )
}

function BannerMedia({
    bannerUrl,
    width,
    event,
}: {
    bannerUrl: string
    width: number
    event: GetEventProps
}) {
    if (!bannerUrl) {
        return (
            <View style={{ marginBottom: 14 }}>
                <DefaultBanner
                    category={event.category?.name_no || event.category?.name_en}
                    color={event.category?.color}
                    height={170}
                    borderRadius={18}
                />
            </View>
        )
    }

    if (bannerUrl.endsWith('.svg')) {
        return (
            <View style={{
                borderRadius: 20,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                paddingVertical: 12,
                marginBottom: 14,
            }}>
                <SvgUri width={width - 28} height={(width - 28) / 2.4} uri={bannerUrl} />
            </View>
        )
    }

    return (
        <Image
            source={{ uri: bannerUrl, cache: 'force-cache' }}
            style={{ width: '100%', aspectRatio: 2.2, borderRadius: 20, backgroundColor: '#101010', marginBottom: 14 }}
            resizeMode='cover'
        />
    )
}
