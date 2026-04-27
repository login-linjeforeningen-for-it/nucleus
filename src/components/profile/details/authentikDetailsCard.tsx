import Cluster from '@/components/shared/cluster'
import Text from '@components/shared/text'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import T from '@styles/text'

type AuthentikDetailsCardProps = {
    profile: Profile | null
    fallbackGroups: string[]
    loading: boolean
    error: string | null
    lang: boolean
}

export default function AuthentikDetailsCard({
    profile,
    fallbackGroups,
    loading,
    error,
    lang
}: AuthentikDetailsCardProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const groups = collectGroups(profile, fallbackGroups)
    const isUnauthorized = error?.toLowerCase() === 'unauthorized'
    const visibleError = isUnauthorized ? null : error

    return (
        <Cluster>
            <View style={{ padding: 16, gap: 12 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>
                    {lang ? 'Roller' : 'Roles'}
                </Text>
                {loading ? (
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                        {lang ? 'Henter roller ...' : 'Loading roles ...'}
                    </Text>
                ) : null}
                {visibleError ? (
                    <Text style={{ ...T.text15, color: theme.orange }}>
                        {visibleError}
                    </Text>
                ) : null}
                {groups.length ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {groups.map((group) => (
                            <View
                                key={group}
                                style={{
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: theme.orangeTransparent,
                                    backgroundColor: theme.orangeTransparentBorder,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5
                                }}
                            >
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    {group}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                        {lang ? 'Ingen grupper rapportert' : 'No groups reported'}
                    </Text>
                )}
            </View>
        </Cluster>
    )
}

function collectGroups(profile: Profile | null, fallbackGroups: string[]) {
    const groups = [
        ...(profile?.groups || []),
        ...fallbackGroups,
    ]

    return [...new Set(groups.filter(Boolean))]
}
