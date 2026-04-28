import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, View } from 'react-native'
import { useSelector } from 'react-redux'

export function AlbumPill({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.orangeTransparentBorder,
            backgroundColor: theme.orangeTransparent,
            paddingHorizontal: 10,
            paddingVertical: 5,
        }}>
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </View>
    )
}

export function AlbumImageStack({ albumID, images, title }: {
    albumID: number
    images: string[]
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!images.length) {
        return (
            <View style={{
                flex: 1,
                borderRadius: 18,
                backgroundColor: theme.contrast,
                borderWidth: 1,
                borderColor: '#ffffff14',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Text style={{ ...T.text20, color: theme.orange }}>LOGIN</Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {images.map((image, index) => (
                <Image
                    key={image}
                    source={{ uri: `${config.cdn}/albums/${albumID}/${image}`, cache: 'force-cache' }}
                    accessibilityLabel={title}
                    style={{
                        position: 'absolute',
                        left: index === 0 ? 12 : index === 1 ? 0 : 24,
                        right: index === 0 ? 12 : index === 1 ? 26 : 0,
                        top: index === 0 ? 0 : index === 1 ? 12 : 20,
                        bottom: index === 0 ? 0 : index === 1 ? 8 : 16,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: '#ffffff24',
                        transform: [{ rotate: index === 1 ? '-3deg' : index === 2 ? '3deg' : '0deg' }],
                        zIndex: 10 - index,
                    }}
                />
            ))}
        </View>
    )
}
