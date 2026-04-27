import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { BlurView } from 'expo-blur'
import { NavigationProp } from '@react-navigation/native'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

type InternalNavRoute = Extract<keyof MenuStackParamList,
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
    activeRoute: InternalNavRoute
    navigation: NavigationProp<MenuStackParamList>
}

export default function InternalNavMenu({ activeRoute, navigation }: Props): JSX.Element | null {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [open, setOpen] = useState(false)

    const items = useMemo<InternalMenuItem[]>(() => {
        const internalItems: InternalMenuItem[] = [
            {
                label: lang ? 'Queenbee-oversikt' : 'Queenbee dashboard',
                description: lang
                    ? 'Oversikt, nøkkeltall og hurtigstatus'
                    : 'Overview, dashboard metrics, and quick status',
                route: 'QueenbeeScreen',
            },
            {
                label: lang ? 'Intern status' : 'Internal status',
                description: lang
                    ? 'Containere, vertsmålinger og oppetid'
                    : 'Containers, host metrics, and uptime',
                route: 'StatusScreen',
            },
            {
                label: lang ? 'Lastbalansering' : 'Load balancing',
                description: lang
                    ? 'Trafikkmål og bytte av primærnode'
                    : 'Traffic targets and primary switching',
                route: 'LoadBalancingScreen',
            },
            {
                label: lang ? 'Trafikk' : 'Traffic',
                description: lang
                    ? 'Forespørsler, domener, stier og klienter'
                    : 'Request metrics, domains, paths, and clients',
                route: 'TrafficScreen',
            },
            {
                label: lang ? 'Innhold' : 'Content',
                description: lang
                    ? 'Regler, lokasjoner og organisasjoner'
                    : 'Rules, locations, and organizations',
                route: 'ContentScreen',
            },
            {
                label: lang ? 'Kunngjøringer' : 'Announcements',
                description: lang
                    ? 'Discord kunngjøringer fra TekKom-boten'
                    : 'Discord announcements from the TekKom bot',
                route: 'AnnouncementsScreen',
            },
            {
                label: lang ? 'Varsler' : 'Alerts',
                description: lang
                    ? 'Sidevarsler fra Workerbee'
                    : 'Website page alerts from Workerbee',
                route: 'AlertsScreen',
            },
            {
                label: lang ? 'Nucleus-dokumentasjon' : 'Nucleus docs',
                description: lang ? 'Varslinger' : 'Notifications',
                route: 'NucleusDocumentationScreen',
            },
            {
                label: 'Honey',
                description: lang
                    ? 'Tekstsnutter og sideinnhold for tjenester'
                    : 'Service text snippets and page content',
                route: 'HoneyScreen',
            },
            {
                label: lang ? 'Databaser' : 'Databases',
                description: lang
                    ? 'Klynger, aktive spørringer, tabeller og sikkerhetskopier'
                    : 'Clusters, active queries, tables, and backups',
                route: 'DatabaseScreen',
            },
            {
                label: lang ? 'Sårbarheter' : 'Vulnerabilities',
                description: lang
                    ? 'Images, skanninger og funn'
                    : 'Images, scans, and findings',
                route: 'VulnerabilitiesScreen',
            },
            {
                label: lang ? 'Logger' : 'Logs',
                description: lang
                    ? 'Interne applikasjons- og vertslogger'
                    : 'Internal application and host logs',
                route: 'LogsScreen',
            },
        ]

        return internalItems.filter(item => item.route !== activeRoute)
    }, [activeRoute, lang])

    useEffect(() => {
        navigation.setOptions({
            headerComponents: {
                right: [
                    <Pressable
                        key='queenbee-internal-menu'
                        onPress={() => setOpen((current) => !current)}
                        style={({ pressed }) => ({
                            marginRight: 10,
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            borderWidth: 1,
                            borderColor: open ? 'rgba(253,135,56,0.24)' : 'rgba(255,255,255,0.08)',
                            backgroundColor: open
                                ? 'rgba(253,135,56,0.12)'
                                : pressed
                                    ? 'rgba(255,255,255,0.10)'
                                    : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        })}
                    >
                        <BlurView
                            style={StyleSheet.absoluteFill}
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
                    </Pressable>
                ]
            }
        } as any)
    }, [navigation, open, theme.orange])

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
                        onPress={() => {
                            setOpen(false)
                            navigation.navigate(item.route)
                        }}
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
