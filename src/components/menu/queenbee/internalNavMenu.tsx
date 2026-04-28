import Space from '@/components/shared/utils'
import { PinAction, PinnedLine } from '@components/menu/root/menuCards'
import HeaderIconButton from '@components/nav/headerIconButton'
import Text from '@components/shared/text'
import T from '@styles/text'
import { defaultInternalPinnedRoutes, usePinnedRoutes } from '@utils/menu/pinnedRoutes'
import { BlurView } from 'expo-blur'
import { JSX, useMemo, useState } from 'react'
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { useSelector } from 'react-redux'

export type InternalNavRoute = Extract<keyof MenuStackParamList,
    'QueenbeeScreen'
    | 'StatusScreen'
    | 'LoadBalancingScreen'
    | 'TrafficScreen'
    | 'TrafficRecordsScreen'
    | 'TrafficMapScreen'
    | 'ContentScreen'
    | 'AnnouncementsScreen'
    | 'AlertsScreen'
    | 'HoneyScreen'
    | 'NucleusDocumentationScreen'
    | 'DatabaseScreen'
    | 'DatabaseBackupsScreen'
    | 'VulnerabilitiesScreen'
    | 'LogsScreen'
>

type InternalMenuItem = {
    label: string
    description: string
    route: InternalNavRoute
}

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

    const items = useMemo<InternalMenuItem[]>(() => {
        const internalItems: InternalMenuItem[] = [
            {
                label: lang ? 'Varsler' : 'Alerts',
                description: lang ? 'Sidevarsler fra Workerbee' : 'Website page alerts from Workerbee',
                route: 'AlertsScreen',
            },
            {
                label: lang ? 'Kunngjøringer' : 'Announcements',
                description: lang ? 'Discord kunngjøringer fra TekKom-boten' : 'Discord announcements from the TekKom bot',
                route: 'AnnouncementsScreen',
            },
            {
                label: lang ? 'Dashboard' : 'Dashboard',
                description: lang
                    ? 'Oversikt, nøkkeltall og hurtigstatus'
                    : 'Overview, dashboard metrics, and quick status',
                route: 'QueenbeeScreen',
            },
            {
                label: lang ? 'Innhold' : 'Content',
                description: lang ? 'Regler, lokasjoner og organisasjoner' : 'Rules, locations, and organizations',
                route: 'ContentScreen',
            },
            {
                label: lang ? 'Databaser' : 'Databases',
                description: lang
                    ? 'Klynger, aktive spørringer, tabeller og sikkerhetskopier'
                    : 'Clusters, active queries, tables, and backups',
                route: 'DatabaseScreen',
            },
            {
                label: 'Honey',
                description: lang
                    ? 'Tekstsnutter og sideinnhold for tjenester'
                    : 'Service text snippets and page content',
                route: 'HoneyScreen',
            },
            {
                label: lang ? 'Intern status' : 'Internal status',
                description: lang ? 'Containere, vertsmålinger og oppetid' : 'Containers, host metrics, and uptime',
                route: 'StatusScreen',
            },
            {
                label: lang ? 'Lastbalansering' : 'Load balancing',
                description: lang ? 'Trafikkmål og bytte av primærnode' : 'Traffic targets and primary switching',
                route: 'LoadBalancingScreen',
            },
            {
                label: lang ? 'Logger' : 'Logs',
                description: lang
                    ? 'Interne applikasjons- og vertslogger'
                    : 'Internal application and host logs',
                route: 'LogsScreen',
            },
            {
                label: lang ? 'Nucleus dokumentasjon' : 'Nucleus docs',
                description: lang ? 'Varslinger' : 'Notifications',
                route: 'NucleusDocumentationScreen',
            },
            {
                label: lang ? 'Trafikk' : 'Traffic',
                description: lang
                    ? 'Forespørsler, domener, stier og klienter'
                    : 'Request metrics, domains, paths, and clients',
                route: 'TrafficScreen',
            },
            {
                label: lang ? 'Sårbarheter' : 'Vulnerabilities',
                description: lang ? 'Images, skanninger og funn' : 'Images, scans, and findings',
                route: 'VulnerabilitiesScreen',
            },
        ]

        return internalItems
            .filter(item => item.route !== activeRoute)
            .sort((first, second) => {
                const firstPinnedIndex = pinnedRoutes.indexOf(first.route)
                const secondPinnedIndex = pinnedRoutes.indexOf(second.route)
                const firstPinned = firstPinnedIndex !== -1
                const secondPinned = secondPinnedIndex !== -1

                if (firstPinned || secondPinned) {
                    return (firstPinned ? firstPinnedIndex : pinnedRoutes.length)
                        - (secondPinned ? secondPinnedIndex : pinnedRoutes.length)
                }

                if (first.route === 'QueenbeeScreen') {
                    return -1
                }

                if (second.route === 'QueenbeeScreen') {
                    return 1
                }

                return first.label.localeCompare(second.label, lang ? 'nb' : 'en')
            })
    }, [activeRoute, lang, pinnedRoutes])

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
            <ScrollView style={{
                padding: 12,
                maxHeight: Dimensions.get('window').height * 0.7,
            }} contentContainerStyle={{ paddingBottom: 4 }}>
                {items.map((item) => {
                    const pinned = pinnedRoutes.includes(item.route)

                    return (
                        <Swipeable
                            key={item.route}
                            renderRightActions={() => <PinAction pinned={pinned} theme={theme} />}
                            rightThreshold={44}
                            overshootRight={false}
                            onSwipeableOpen={(direction) => direction === 'right' ? togglePinnedRoute(item.route) : undefined}
                        >
                            <Pressable
                                onPress={() => onNavigate(item.route)}
                                style={{
                                    borderRadius: 16,
                                    backgroundColor: '#ffffff08',
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    marginBottom: 8
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
        </View>
    )
}
