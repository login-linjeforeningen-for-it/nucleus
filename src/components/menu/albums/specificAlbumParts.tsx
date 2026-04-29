import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { formatNorwegianDate } from '@utils/general'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Download, X } from 'lucide-react-native'
import { Pressable, TouchableOpacity, View } from 'react-native'
import { AlbumPill } from './albumCards'

export function formatAlbumDate(value?: string | null) {
    const formatted = formatNorwegianDate(value, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

    return formatted ? `${formatted} - ` : ''
}

export function formatShortDate(value: string) {
    return formatNorwegianDate(value, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }, value)
}

export function SpecificAlbumSummary({
    album,
    description,
    lang,
    navigation,
    text,
    theme,
    title,
}: {
    album: GetAlbumProps
    description: string
    lang: boolean
    navigation: MenuProps<'SpecificAlbumScreen'>['navigation']
    text: any
    theme: Theme
    title: string
}) {
    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <Text style={{ ...T.text25, color: theme.textColor }}>
                    {title}
                </Text>
                <Space height={8} />
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                    {`${formatAlbumDate(album.event?.time_start)}${description}`}
                </Text>
                <Space height={12} />
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <AlbumPill label={String(album.year)} />
                    <AlbumPill label={`${album.image_count || album.images?.length || 0} ${text.images}`} />
                    <AlbumPill label={`${text.updated} ${formatShortDate(album.updated_at)}`} />
                </View>
                <AlbumEventLink album={album} lang={lang} navigation={navigation} text={text} theme={theme} />
            </View>
        </Cluster>
    )
}

export function AlbumDownloadButton({
    downloading,
    onPress,
    showDownloadSheet,
    text,
    theme,
}: {
    downloading?: boolean
    onPress: () => void
    showDownloadSheet: boolean
    text: any
    theme: Theme
}) {
    const active = showDownloadSheet || downloading

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={showDownloadSheet ? text.close : text.downloadImages}
            testID='album-download-button'
            onPress={onPress}
            style={({ pressed }) => ({
                position: 'absolute',
                zIndex: 14,
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: active ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
                backgroundColor: active
                    ? theme.orangeTransparent
                    : pressed ? theme.greyTransparent : 'transparent',
            })}
        >
            {showDownloadSheet ? (
                <X size={24} color={theme.orange} strokeWidth={2.4} />
            ) : (
                <Download size={22} color={active ? theme.orange : theme.oppositeTextColor} strokeWidth={2.3} />
            )}
        </Pressable>
    )
}

function AlbumEventLink({
    album,
    lang,
    navigation,
    text,
    theme,
}: {
    album: GetAlbumProps
    lang: boolean
    navigation: MenuProps<'SpecificAlbumScreen'>['navigation']
    text: any
    theme: Theme
}) {
    if (!album.event) {
        return null
    }

    return (
        <>
            <Space height={12} />
            <TouchableOpacity
                onPress={() => {
                    const tabNavigation = navigation.getParent<BottomTabNavigationProp<TabBarParamList>>()
                    if (album.event?.id) {
                        tabNavigation?.navigate('EventNav', {
                            screen: 'SpecificEventScreen',
                            params: { eventID: album.event.id },
                        })
                    }
                }}
                activeOpacity={0.88}
            >
                <View style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.orangeTransparentBorder,
                    backgroundColor: theme.orangeTransparent,
                    padding: 12,
                }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {text.event}
                    </Text>
                    <Space height={4} />
                    <Text style={{ ...T.text15, color: theme.textColor }}>
                        {lang ? album.event.name_no : album.event.name_en}
                    </Text>
                </View>
            </TouchableOpacity>
        </>
    )
}
