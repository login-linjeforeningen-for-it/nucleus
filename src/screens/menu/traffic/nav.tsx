import Text from '@components/shared/text'
import { useSwipeNavigationLock } from '@components/nav/swipe'
import T from '@styles/text'
import { NavigationProp } from '@react-navigation/native'
import { Dimensions, Pressable, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

type TrafficNavigation = NavigationProp<MenuStackParamList>

export function TrafficTabs({
    active,
    navigation,
}: {
    active: 'metrics' | 'records' | 'map'
    navigation: TrafficNavigation
}) {
    return (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <TrafficTab label='Metrics' active={active === 'metrics'} onPress={() => navigation.navigate('TrafficScreen')} />
            <TrafficTab
                label='Records'
                active={active === 'records'}
                onPress={() => navigation.navigate('TrafficRecordsScreen')}
            />
            <TrafficTab
                label='Map'
                active={active === 'map'}
                onPress={() => navigation.navigate('TrafficMapScreen')}
            />
        </View>
    )
}

export function DomainPicker({
    domains,
    selectedDomain,
    onSelect,
}: {
    domains: string[]
    selectedDomain: string
    onSelect: (domain: string) => void
}) {
    const swipeNavigation = useSwipeNavigationLock()

    return (
        <ScrollView
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            onTouchStart={swipeNavigation.lock}
            onTouchEnd={swipeNavigation.unlock}
            onTouchCancel={swipeNavigation.unlock}
            showsHorizontalScrollIndicator={false}
            style={{ width: '100%', maxHeight: 44 }}
            contentContainerStyle={{
                flexDirection: 'row',
                gap: 8,
                minWidth: Dimensions.get('window').width - 24,
                paddingRight: 18,
            }}
        >
            <View style={{ flexDirection: 'row', gap: 8, flexShrink: 0 }}>
                <ChoicePill label='All domains' active={!selectedDomain} onPress={() => onSelect('')} />
                {domains.map(domain => (
                    <ChoicePill
                        key={domain}
                        label={domain}
                        active={selectedDomain === domain}
                        onPress={() => onSelect(domain)}
                    />
                ))}
            </View>
        </ScrollView>
    )
}

function TrafficTab({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable onPress={onPress} style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: active ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
            backgroundColor: active ? theme.orangeTransparent : '#ffffff08',
            paddingHorizontal: 14,
            paddingVertical: 9,
        }}>
            <Text style={{ ...T.text12, color: active ? theme.orange : theme.textColor }}>{label}</Text>
        </Pressable>
    )
}

function ChoicePill({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={onPress}
            style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
                backgroundColor: active ? theme.orangeTransparent : '#ffffff08',
                paddingHorizontal: 12,
                paddingVertical: 8,
            }}
        >
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}
