import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { BlurView } from 'expo-blur'
import { JSX, useMemo, useState } from 'react'
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
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
            <InternalNavMenuButton open={open} onPress={() => setOpen((current) => !current)} />
            <InternalNavMenuDropdown
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

export function InternalNavMenuButton({ open, onPress }: { open: boolean; onPress: () => void }) {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'visible',
        }}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => ({
                    width: '100%',
                    height: '100%',
                    borderRadius: 19,
                    backgroundColor: open
                        ? 'rgba(253,135,56,0.12)'
                        : pressed
                            ? 'rgba(255,255,255,0.10)'
                            : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    margin: 0,
                })}
            >
                <BlurView
                    style={{
                        ...StyleSheet.absoluteFill,
                        borderRadius: 19,
                    }}
                    blurMethod='dimezisBlurView'
                    intensity={Platform.OS === 'ios' ? 35 : 24}
                />
                <View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: open
                        ? 'rgba(253,135,56,0.12)'
                        : isDark
                            ? 'rgba(255,255,255,0.07)'
                            : theme.transparentAndroid,
                }} />
                <Text style={{
                    ...T.text20,
                    color: theme.orange,
                    fontSize: 24,
                    lineHeight: 24,
                    fontWeight: '700',
                    marginTop: Platform.OS === 'ios' ? -1 : -3,
                }}>
                    ≡
                </Text>
                <View
                    pointerEvents='none'
                    style={{
                        ...StyleSheet.absoluteFill,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: open ? 'rgba(253,135,56,0.32)' : 'rgba(255,255,255,0.14)',
                    }}
                />
            </Pressable>
        </View>
    )
}

export function InternalNavMenuDropdown({
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
                if (first.route === 'QueenbeeScreen') {
                    return -1
                }

                if (second.route === 'QueenbeeScreen') {
                    return 1
                }

                return first.label.localeCompare(second.label, lang ? 'nb' : 'en')
            })
    }, [activeRoute, lang])

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
                {items.map((item) => (
                    <Pressable
                        key={item.route}
                        onPress={() => onNavigate(item.route)}
                        style={{
                            borderRadius: 16,
                            backgroundColor: '#ffffff08',
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            marginBottom: 8
                        }}
                    >
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
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}
