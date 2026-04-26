import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { NavigationProp } from '@react-navigation/native'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Dimensions, Platform, Pressable, View } from 'react-native'
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
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [open, setOpen] = useState(false)

    const items = useMemo<InternalMenuItem[]>(() => {
        const internalItems: InternalMenuItem[] = [
            {
                label: 'Queenbee dashboard',
                description: 'Overview, dashboard metrics, and quick status',
                route: 'QueenbeeScreen',
            },
            {
                label: 'Internal status',
                description: 'Containers, host metrics, and uptime',
                route: 'StatusScreen',
            },
            {
                label: 'Load balancing',
                description: 'Traffic targets and primary switching',
                route: 'LoadBalancingScreen',
            },
            {
                label: 'Traffic metrics',
                description: 'Request metrics, domains, paths, and clients',
                route: 'TrafficScreen',
            },
            {
                label: 'Traffic records',
                description: 'Recent request log with pagination and filters',
                route: 'TrafficRecordsScreen',
            },
            {
                label: 'Traffic map',
                description: 'Live request hotspots and country focus',
                route: 'TrafficMapScreen',
            },
            {
                label: 'Content',
                description: 'Rules, locations, and organizations',
                route: 'ContentScreen',
            },
            {
                label: 'Announcements',
                description: 'Discord announcements from the TekKom bot',
                route: 'AnnouncementsScreen',
            },
            {
                label: 'Alerts',
                description: 'Website page alerts from Workerbee',
                route: 'AlertsScreen',
            },
            {
                label: 'Nucleus docs',
                description: 'Push topics, intervals, and notification examples',
                route: 'NucleusDocumentationScreen',
            },
            {
                label: 'Honey',
                description: 'Service text snippets and page content',
                route: 'HoneyScreen',
            },
            {
                label: 'Databases',
                description: 'Clusters, databases, and active queries',
                route: 'DatabaseScreen',
            },
            {
                label: 'Database backups',
                description: 'Backup health, restore files, and backup trigger',
                route: 'DatabaseBackupsScreen',
            },
            {
                label: 'Vulnerabilities',
                description: 'Images, scans, and findings',
                route: 'VulnerabilitiesScreen',
            },
            {
                label: 'Logs',
                description: 'Internal application and host logs',
                route: 'LogsScreen',
            },
        ]

        return internalItems.filter(item => item.route !== activeRoute)
    }, [activeRoute])

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
                                    : 'rgba(255,255,255,0.05)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        })}
                    >
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
            top: Dimensions.get('window').height / 8 + 42,
            right: 12,
            left: 12,
            zIndex: 20,
            borderRadius: 22,
            backgroundColor: '#121112ee',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            padding: 12,
            gap: 8,
        }}>
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
        </View>
    )
}
