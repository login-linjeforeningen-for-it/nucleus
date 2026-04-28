import Cluster from '@/components/shared/cluster'
import Text from '@components/shared/text'
import { NavigationProp } from '@react-navigation/native'
import T from '@styles/text'
import { Pin } from 'lucide-react-native'
import { Image, TouchableOpacity, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { useSelector } from 'react-redux'

const avatarFrameStyle = {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden' as const,
    backgroundColor: 'rgba(253,135,56,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
}

export function ProfileMenuCard({
    navigation,
    login,
    name,
    picture,
    email,
    lang,
}: {
    navigation: NavigationProp<MenuStackParamList, 'MenuScreen'>
    login: boolean
    name: string | null
    picture: string | null
    email: string | null
    lang: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} activeOpacity={0.9}>
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ paddingHorizontal: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={avatarFrameStyle}>
                        {picture ? <Image source={{ uri: picture }} style={{ width: 64, height: 64, resizeMode: 'cover' }} /> : <ProfilePlaceholder />}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 6 }}>
                            {login ? (name || (lang ? 'Profil' : 'Profile')) : (lang ? 'Profil' : 'Profile')}
                        </Text>
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {login
                                ? email || (lang ? 'Konto og personlige verktøy' : 'Account, and personal tools')
                                : (lang ? 'Innlogging og kontoverktøy' : 'Sign-in and account tools')}
                        </Text>
                    </View>
                    <View style={{ width: 18, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ ...T.text20, color: theme.orange, fontWeight: '700', lineHeight: 22 }}>
                            ›
                        </Text>
                    </View>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}

export function MenuItem({ item, navigation, subtitle, pinned, onTogglePinned }: {
    item: ItemProps
    navigation: NavigationProp<MenuStackParamList, 'MenuScreen'>
    subtitle: string
    pinned: boolean
    onTogglePinned: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Swipeable
            renderRightActions={() => <PinAction pinned={pinned} theme={theme} />}
            rightThreshold={44}
            overshootRight={false}
            onSwipeableOpen={(direction) => direction === 'right' ? onTogglePinned() : undefined}
        >
            <TouchableOpacity onPress={() => navigation.navigate(item.nav as any)} activeOpacity={0.88}>
                <Cluster style={{ paddingHorizontal: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 14, paddingVertical: 6, gap: 12 }}>
                        <PinnedLine pinned={pinned} theme={theme} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 4 }}>
                                {item.title}
                            </Text>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {subtitle}
                            </Text>
                        </View>
                        <View style={{ width: 18, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ ...T.text20, color: theme.orange, fontWeight: '700', lineHeight: 22 }}>
                                ›
                            </Text>
                        </View>
                    </View>
                </Cluster>
            </TouchableOpacity>
        </Swipeable>
    )
}

export function PinnedLine({ pinned, theme }: { pinned: boolean, theme: Theme }) {
    if (!pinned) {
        return (
            <View style={{
                width: 3,
                alignSelf: 'stretch',
                borderRadius: 99,
                backgroundColor: theme.orange,
                opacity: 0.55,
                marginTop: 2
            }} />
        )
    }

    return (
        <View style={{ width: 10, alignSelf: 'stretch', alignItems: 'center', marginTop: 2 }}>
            <View style={{ width: 3, borderRadius: 99, backgroundColor: theme.orange, opacity: 0.55 }} />
            <View style={{
                height: 14,
                width: 14,
                borderRadius: 7,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Pin color={theme.orange} size={9} strokeWidth={2.4} fill={theme.orange} />
            </View>
            <View style={{ width: 3, flex: 1, borderRadius: 99, backgroundColor: theme.orange, opacity: 0.55 }} />
        </View>
    )
}

export function PinAction({ pinned, theme }: { pinned: boolean, theme: Theme }) {
    return (
        <View style={{
            width: 76,
            marginVertical: 6,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.orangeTransparent,
        }}>
            <Pin color={theme.orange} size={18} strokeWidth={2.2} fill={pinned ? theme.orange : 'transparent'} />
            <Text style={{ ...T.text12, color: theme.orange, marginTop: 4 }}>
                {pinned ? 'Unpin' : 'Pin'}
            </Text>
        </View>
    )
}

function ProfilePlaceholder() {
    return (
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.14)', marginBottom: 4 }} />
            <View style={{
                width: 30,
                height: 18,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.10)',
            }} />
        </View>
    )
}
