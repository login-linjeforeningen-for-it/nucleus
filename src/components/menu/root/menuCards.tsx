import Cluster from '@/components/shared/cluster'
import Text from '@components/shared/text'
import { NavigationProp } from '@react-navigation/native'
import T from '@styles/text'
import { Image, TouchableOpacity, View } from 'react-native'
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
                    <Text style={{ ...T.text20, color: theme.orange, fontWeight: '700' }}>›</Text>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}

export function MenuItem({ item, navigation, subtitle }: {
    item: ItemProps
    navigation: NavigationProp<MenuStackParamList, 'MenuScreen'>
    subtitle: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity onPress={() => navigation.navigate(item.nav as any)} activeOpacity={0.88}>
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, gap: 12 }}>
                    <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 99, backgroundColor: theme.orange, opacity: 0.55, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 4 }}>
                            {item.title}
                        </Text>
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {subtitle}
                        </Text>
                    </View>
                    <Text style={{ ...T.text20, color: theme.orange, fontWeight: '700' }}>›</Text>
                </View>
            </Cluster>
        </TouchableOpacity>
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
