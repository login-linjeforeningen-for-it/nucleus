import Space from '@/components/shared/utils'
import AuthentikDetailsCard from '@/components/profile/details/authentikDetailsCard'
import Text from '@components/shared/text'
import { startLogin } from '@utils/auth/auth'
import { TouchableOpacity, View } from 'react-native'
import T from '@styles/text'

type ProfileActionsProps = {
    navigation: MenuProps<'ProfileScreen'>['navigation']
    login: boolean
    groups: string[]
    profile: Profile | null
    loading: boolean
    error: string | null
    lang: boolean
    theme: Theme
    onLogout: () => void
}

type ActionButtonProps = {
    text: string
    theme: Theme
    tone?: 'orange'
    onPress: () => void
}

export default function ProfileActions({
    navigation,
    login,
    groups,
    profile,
    loading,
    error,
    lang,
    theme,
    onLogout
}: ProfileActionsProps) {
    return (
        <>
            <View style={{ paddingHorizontal: 12 }}>
                <ActionButton
                    text={lang ? 'Åpne Login AI' : 'Open Login AI'}
                    tone='orange'
                    theme={theme}
                    onPress={() => navigation.navigate('AiScreen')}
                />
                <Space height={12} />
                {login ? (
                    <ActionButton
                        text={lang ? 'Åpne Queenbee' : 'Open Queenbee'}
                        theme={theme}
                        onPress={() => navigation.navigate('QueenbeeScreen')}
                    />
                ) : null}
            </View>
            {login ? (
                <>
                    <Space height={20} />
                    <AuthentikDetailsCard
                        profile={profile}
                        fallbackGroups={groups}
                        loading={loading}
                        error={error}
                        lang={lang}
                    />
                    <Space height={12} />
                    <View style={{ paddingHorizontal: 12 }}>
                        <ActionButton
                            text={lang ? 'Logg ut' : 'Log out'}
                            theme={theme}
                            onPress={onLogout}
                        />
                    </View>
                </>
            ) : (
                <>
                    <Space height={12} />
                    <View style={{ paddingHorizontal: 12 }}>
                        <ActionButton
                            text={lang ? 'Logg inn' : 'Sign in'}
                            theme={theme}
                            onPress={() => startLogin('queenbee')}
                        />
                    </View>
                </>
            )}
        </>
    )
}

function ActionButton({ text, theme, tone, onPress }: ActionButtonProps) {
    const isOrange = tone === 'orange'

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: isOrange ? theme.orangeTransparent : '#ffffff12',
                backgroundColor: isOrange ? theme.orangeTransparentBorder : theme.contrast,
                padding: 14
            }}>
                <Text style={{ ...T.centered20, color: theme.textColor }}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    )
}
