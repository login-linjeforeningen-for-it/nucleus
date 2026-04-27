import { JSX, ReactNode } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Text from '@components/shared/text'
import T from '@styles/text'

export function GlassCard({ theme, children, accent }: {
    theme: Theme,
    children: ReactNode,
    accent?: boolean
}): JSX.Element {
    return (
        <View
            style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: accent ? theme.orangeTransparentBorderHighlighted : theme.greyTransparentBorder,
                backgroundColor: accent ? theme.orangeTransparent : theme.greyTransparent,
                padding: 16,
                overflow: 'hidden',
            }}
        >
            {children}
        </View>
    )
}

export function ActionCard({ theme, title, description, label, onPress, subtle }: {
    theme: Theme,
    title: string,
    description: string,
    label: string,
    onPress: () => void,
    subtle?: boolean
}): JSX.Element {
    return (
        <TouchableOpacity activeOpacity={0.86} onPress={onPress}>
            <View
                style={{
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: subtle ? theme.greyTransparentBorder : theme.orangeTransparentBorder,
                    backgroundColor: subtle ? theme.greyTransparent : theme.orangeTransparent,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                }}
            >
                <View style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: theme.orangeTransparentHighlighted,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{ ...T.text20, color: theme.orange }}>›</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ ...T.text175, color: theme.textColor }}>
                        {title}
                    </Text>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor, lineHeight: 18 }}>
                        {description}
                    </Text>
                </View>
                <Text style={{ ...T.text12, color: theme.orange }}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export function StatusPill({ theme, label, active }: {
    theme: Theme,
    label: string,
    active: boolean
}): JSX.Element {
    return (
        <View
            style={{
                alignSelf: 'flex-start',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? '#5de39166' : theme.greyTransparentBorder,
                backgroundColor: active ? '#5de39122' : '#ffffff08',
                paddingHorizontal: 10,
                paddingVertical: 6,
            }}
        >
            <Text style={{ ...T.text12, color: active ? '#85f2ad' : theme.oppositeTextColor }}>
                {label}
            </Text>
        </View>
    )
}

export function RoleChips({ theme, groups, login }: {
    theme: Theme,
    groups: string[],
    login: boolean
}): JSX.Element {
    const visibleGroups = login && groups.length ? groups : [login ? 'No groups attached' : 'Not authenticated yet']

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {visibleGroups.map(group => (
                <View
                    key={group}
                    style={{
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: group === 'queenbee' ? theme.orangeTransparentBorderHighlighted : theme.greyTransparentBorder,
                        backgroundColor: group === 'queenbee' ? theme.orangeTransparent : '#ffffff08',
                        paddingHorizontal: 10,
                        paddingVertical: 7,
                    }}
                >
                    <Text style={{ ...T.text12, color: theme.textColor }}>
                        {group}
                    </Text>
                </View>
            ))}
        </View>
    )
}
