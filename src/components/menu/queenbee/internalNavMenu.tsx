import Space from '@/components/shared/utils'
import { HideAction, HiddenToggle, PinAction, PinnedLine } from '@components/menu/root/menuCards'
import HeaderIconButton from '@components/nav/headerIconButton'
import Text from '@components/shared/text'
import T from '@styles/text'
import { defaultInternalPinnedRoutes, usePinnedRoutes } from '@utils/menu/pinnedRoutes'
import { BlurView } from 'expo-blur'
import { JSX, useMemo, useState } from 'react'
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { useSelector } from 'react-redux'
import {
    InternalNavRoute, countHiddenInternalRoutes, getInternalMenuItems, sortInternalMenuItems,
} from './internalNavRoutes'

export type { InternalNavRoute } from './internalNavRoutes'

type Props = {
    activeRoute?: string
    onNavigate: (route: InternalNavRoute) => void
}

export default function InternalNavMenu({ activeRoute, onNavigate }: Props): JSX.Element {
    const [open, setOpen] = useState(false)

    return (
        <>
            <NavButton open={open} onPress={() => setOpen((current) => !current)} />
            <NavDropdown
                activeRoute={activeRoute}
                open={open}
                onNavigate={(route) => {
                    setOpen(false)
                    onNavigate(route)
                }}
            />
        </>
    )
}

export function NavButton({ open, onPress }: { open: boolean; onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <HeaderIconButton active={open} onPress={onPress}>
            <Text style={{
                ...T.text20,
                color: theme.orange,
                fontSize: 28,
                lineHeight: 28,
                fontWeight: '300',
                marginTop: Platform.OS === 'ios' ? -1 : -3,
            }}>
                ≡
            </Text>
        </HeaderIconButton>
    )
}

export function NavDropdown({
    activeRoute,
    open,
    onNavigate,
}: {
    activeRoute?: string
    open: boolean
    onNavigate: (route: InternalNavRoute) => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { pinnedRoutes, togglePinnedRoute } = usePinnedRoutes('menu:internal-pinned-routes', defaultInternalPinnedRoutes)
    const { pinnedRoutes: hiddenRoutes, togglePinnedRoute: toggleHiddenRoute } = usePinnedRoutes('menu:internal-hidden-routes', [])
    const [showHidden, setShowHidden] = useState(false)

    const items = useMemo(() => (
        getInternalMenuItems(lang)
            .filter(item => item.route !== activeRoute)
            .filter(item => showHidden || !hiddenRoutes.includes(item.route))
            .sort((first, second) => sortInternalMenuItems(first, second, pinnedRoutes, lang))
    ), [activeRoute, hiddenRoutes, lang, pinnedRoutes, showHidden])
    const hiddenCount = useMemo(() => countHiddenInternalRoutes(hiddenRoutes, activeRoute), [activeRoute, hiddenRoutes])

    if (!open) {
        return null
    }

    return (
        <View style={{
            position: 'absolute',
            top: Dimensions.get('window').height / 8 + 8,
            right: 16,
            left: 16,
            zIndex: 20,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
            backgroundColor: 'rgba(18,17,18,0.72)',
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12,
        }}>
            <BlurView
                style={StyleSheet.absoluteFill}
                blurMethod='dimezisBlurView'
                intensity={Platform.OS === 'ios' ? 35 : 24}
            />
            <View style={{ padding: 12, gap: 10 }}>
                <ScrollView style={{
                    maxHeight: Dimensions.get('window').height * 0.64,
                }} contentContainerStyle={{ paddingBottom: 4 }}>
                    {items.map((item) => {
                        const pinned = pinnedRoutes.includes(item.route)
                        const hidden = hiddenRoutes.includes(item.route)

                        return (
                            <Swipeable
                                key={item.route}
                                renderLeftActions={() => (
                                    <HideAction
                                        hidden={hidden}
                                        onPress={() => toggleHiddenRoute(item.route)}
                                        theme={theme}
                                    />
                                )}
                                renderRightActions={() => (
                                    <PinAction
                                        pinned={pinned}
                                        onPress={() => togglePinnedRoute(item.route)}
                                        theme={theme}
                                    />
                                )}
                                leftThreshold={44}
                                rightThreshold={44}
                                overshootLeft={false}
                                overshootRight={false}
                                onSwipeableOpen={(direction) => {
                                    if (direction === 'left') {
                                        toggleHiddenRoute(item.route)
                                    }
                                    if (direction === 'right') {
                                        togglePinnedRoute(item.route)
                                    }
                                }}
                            >
                                <Pressable
                                    onPress={() => onNavigate(item.route)}
                                    style={{
                                        borderRadius: 16,
                                        backgroundColor: '#ffffff08',
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        marginBottom: 8,
                                        opacity: hidden ? 0.54 : 1,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 10 }}>
                                        <PinnedLine pinned={pinned} theme={theme} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                ...T.text15,
                                                color: theme.textColor,
                                                fontWeight: '700',
                                            }}>
                                                {item.label}
                                            </Text>
                                            <Space height={2} />
                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                {item.description}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            </Swipeable>
                        )
                    })}
                </ScrollView>
                <HiddenToggle
                    hiddenCount={hiddenCount}
                    showHidden={showHidden}
                    onToggle={() => setShowHidden(current => !current)}
                    theme={theme}
                />
            </View>
        </View>
    )
}
