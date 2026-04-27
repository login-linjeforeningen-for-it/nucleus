import Cluster from '@components/shared/cluster'
import Space from '@components/shared/utils'
import T from '@styles/text'
import { Linking, Pressable, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

export function DetailSectionCard({
    title,
    children,
    flush,
}: React.PropsWithChildren<{ title: string, flush?: boolean }>) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster marginHorizontal={flush ? 0 : undefined}>
            <View style={{ padding: 14 }}>
                <Text style={{ ...T.text18, color: theme.textColor, fontWeight: '700' }}>{title}</Text>
                <Space height={10} />
                {children}
            </View>
        </Cluster>
    )
}

export function MetaChip({ label, value }: { label: string, value: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexBasis: '47%',
            flexGrow: 1,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#ffffff12',
            backgroundColor: '#ffffff08',
            padding: 12,
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor, marginBottom: 4 }}>
                {label}
            </Text>
            <Text style={{ ...T.text15, color: theme.textColor }}>
                {value}
            </Text>
        </View>
    )
}

export function ActionLinkButton({ label, url, highlight }: {
    label: string
    url: string
    highlight?: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={() => void Linking.openURL(url)}
            style={{
                flexGrow: 1,
                minWidth: '30%',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: highlight ? theme.orange : '#ffffff14',
                backgroundColor: highlight ? theme.orange : '#ffffff08',
                paddingVertical: 10,
                paddingHorizontal: 12,
                alignItems: 'center',
            }}
        >
            <Text style={{
                ...T.text15,
                color: highlight ? theme.textColor : theme.oppositeTextColor,
                fontWeight: '600'
            }}>
                {label}
            </Text>
        </Pressable>
    )
}
