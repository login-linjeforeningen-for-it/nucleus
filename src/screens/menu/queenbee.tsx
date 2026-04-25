import Space from "@/components/shared/utils"
import EventEditor from "@components/menu/queenbee/eventEditor"
import EventPicker from "@components/menu/queenbee/eventPicker"
import QueenbeeGate from "@components/menu/queenbee/gate"
import OverviewCard from "@components/menu/queenbee/overviewCard"
import SummaryListCard from "@components/menu/queenbee/summaryListCard"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import { JSX, useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    View
} from "react-native"
import { useSelector } from "react-redux"
import {
    getDatabaseOverview,
    getInternalDashboard,
    getLoadBalancingSites,
    getProtectedEvent,
    getVulnerabilitiesOverview,
    listProtectedEvents,
    updateProtectedEvent
} from "@utils/queenbeeApi"
import { startLogin } from "@utils/auth"
import { MenuProps } from "@type/screenTypes"

type EditableEventState = {
    id: number
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    time_start: string
    time_end: string
    link_signup: string
    visible: boolean
    highlight: boolean
    canceled: boolean
}

export default function QueenbeeScreen({ navigation }: MenuProps<"QueenbeeScreen">): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, groups } = useSelector((state: ReduxState) => state.login)
    const [events, setEvents] = useState<GetEventProps[]>([])
    const [selectedEvent, setSelectedEvent] = useState<GetEventProps | null>(null)
    const [form, setForm] = useState<EditableEventState | null>(null)
    const [system, setSystem] = useState<System | null>(null)
    const [sites, setSites] = useState<{ name: string, primary: boolean, operational: boolean, maintenance: boolean }[]>([])
    const [databaseOverview, setDatabaseOverview] = useState<GetDatabaseOverview | null>(null)
    const [vulnerabilities, setVulnerabilities] = useState<GetVulnerabilities | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const hasQueenbee = useMemo(() =>
        groups.map(group => group.toLowerCase()).includes("queenbee"),
    [groups])

    useEffect(() => {
        if (!login || !hasQueenbee) {
            return
        }

        void refresh()
    }, [login, hasQueenbee])

    async function refresh() {
        try {
            setLoading(true)
            setError(null)
            const [eventsPayload, systemPayload, sitesPayload, databasePayload, vulnerabilityPayload] = await Promise.all([
                listProtectedEvents(20).catch(() => ({ events: [], total_count: 0 } as GetEventsProps)),
                getInternalDashboard().catch(() => null),
                getLoadBalancingSites().catch(() => []),
                getDatabaseOverview().catch(() => null),
                getVulnerabilitiesOverview().catch(() => null),
            ])
            setEvents(eventsPayload.events || [])
            setSystem(systemPayload)
            setSites(sitesPayload)
            setDatabaseOverview(databasePayload)
            setVulnerabilities(vulnerabilityPayload)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load Queenbee.")
        } finally {
            setLoading(false)
        }
    }

    const primarySite = useMemo(() => sites.find(site => site.primary) || null, [sites])
    const healthySites = useMemo(() => sites.filter(site => site.operational && !site.maintenance).length, [sites])

    async function openEvent(id: number) {
        try {
            setLoading(true)
            const event = await getProtectedEvent(id)
            setSelectedEvent(event)
            setForm(toEditableEvent(event))
            setSuccess(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load event.")
        } finally {
            setLoading(false)
        }
    }

    async function saveEvent() {
        if (!selectedEvent || !form) {
            return
        }

        try {
            setSaving(true)
            setError(null)
            const payload = {
                visible: form.visible,
                name_no: form.name_no,
                name_en: form.name_en,
                description_no: form.description_no,
                description_en: form.description_en,
                informational_no: selectedEvent.informational_no,
                informational_en: selectedEvent.informational_en,
                time_type: selectedEvent.time_type,
                time_start: form.time_start,
                time_end: form.time_end,
                time_publish: selectedEvent.time_publish,
                time_signup_release: selectedEvent.time_signup_release,
                time_signup_deadline: selectedEvent.time_signup_deadline,
                canceled: form.canceled,
                digital: selectedEvent.digital,
                highlight: form.highlight,
                image_small: selectedEvent.image_small,
                image_banner: selectedEvent.image_banner,
                link_facebook: selectedEvent.link_facebook,
                link_discord: selectedEvent.link_discord,
                link_signup: form.link_signup || null,
                link_stream: selectedEvent.link_stream,
                capacity: selectedEvent.capacity,
                is_full: selectedEvent.is_full,
                category_id: selectedEvent.category.id,
                location_id: selectedEvent.location?.id || null,
                parent_id: selectedEvent.parent_id,
                rule_id: selectedEvent.rule?.id || null,
                audience_id: selectedEvent.audience?.id || null,
                organization_id: selectedEvent.organization?.id || null,
            }

            const updated = await updateProtectedEvent(selectedEvent.id, payload)
            setSelectedEvent(updated)
            setForm(toEditableEvent(updated))
            setSuccess("Event updated.")
            await refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save event.")
        } finally {
            setSaving(false)
        }
    }

    if (!login) {
        return (
            <QueenbeeGate
                backgroundColor={theme.darker}
                textColor={theme.textColor}
                mutedTextColor={theme.oppositeTextColor}
                title='Queenbee'
                body='Sign in to use Queenbee.'
                actionLabel='Sign in'
                actionColor={theme.orange}
                actionTextColor={theme.darker}
                onPress={() => startLogin("queenbee")}
            />
        )
    }

    if (!hasQueenbee) {
        return (
            <QueenbeeGate
                backgroundColor={theme.darker}
                textColor={theme.textColor}
                mutedTextColor={theme.oppositeTextColor}
                title='Queenbee'
                body='Your account is signed in, but it does not currently have Queenbee access.'
            />
        )
    }

    const siteItems = sites.map(site => ({
        title: `${site.name}${site.primary ? " · primary" : ""}`,
        body: `${site.operational ? "Operational" : "Down"}${site.maintenance ? " · maintenance" : ""}`
    }))

    const clusterItems = (databaseOverview?.clusters || []).map(cluster => ({
        title: cluster.name,
        body: `${cluster.databaseCount} databases · ${cluster.activeQueries} active queries`
    }))

    return (
        <Swipe left="MenuScreen">
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView style={GS.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Space height={Dimensions.get("window").height / 8} />
                    <Text style={{ ...T.centeredBold20, color: theme.textColor }}>Queenbee</Text>
                    <Space height={10} />
                    <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                        Native Queenbee and internal workflows for quick changes on the go.
                    </Text>
                    <Space height={16} />
                    {loading && <ActivityIndicator color={theme.orange} />}
                    {error && <Text style={{ ...T.centered15, color: "red" }}>{error}</Text>}
                    {success && <Text style={{ ...T.centered15, color: theme.orange }}>{success}</Text>}

                    <OverviewCard
                        title='Internal status'
                        body={system
                            ? `${system.containers} containers · ${system.load} load · ${system.ram}`
                            : "Internal metrics unavailable right now."}
                        backgroundColor={theme.contrast}
                        textColor={theme.textColor}
                        mutedTextColor={theme.oppositeTextColor}
                        onPress={() => navigation.navigate("StatusScreen")}
                    />

                    <Space height={10} />
                    <OverviewCard
                        title='Load balancing'
                        body={primarySite
                            ? `Primary ${primarySite.name} · ${healthySites}/${sites.length} healthy`
                            : "Load balancing data unavailable right now."}
                        backgroundColor={theme.contrast}
                        textColor={theme.textColor}
                        mutedTextColor={theme.oppositeTextColor}
                        onPress={() => navigation.navigate("LoadBalancingScreen")}
                    />

                    <Space height={10} />
                    <OverviewCard
                        title='Databases'
                        body={databaseOverview
                            ? `${databaseOverview.clusterCount} clusters · ${databaseOverview.databaseCount} databases · ${databaseOverview.activeQueries} active queries`
                            : "Database overview unavailable right now."}
                        backgroundColor={theme.contrast}
                        textColor={theme.textColor}
                        mutedTextColor={theme.oppositeTextColor}
                        onPress={() => navigation.navigate("DatabaseScreen")}
                    />

                    <Space height={10} />
                    <OverviewCard
                        title='Vulnerabilities'
                        body={vulnerabilities
                            ? `${vulnerabilities.imageCount} images · ${vulnerabilities.images.reduce((sum, image) => sum + image.totalVulnerabilities, 0)} findings`
                            : "Vulnerability overview unavailable right now."}
                        backgroundColor={theme.contrast}
                        textColor={theme.textColor}
                        mutedTextColor={theme.oppositeTextColor}
                        onPress={() => navigation.navigate("VulnerabilitiesScreen")}
                    />

                    <Space height={10} />
                    <OverviewCard
                        title='Logs'
                        body='Review container and host logs directly in the app.'
                        backgroundColor={theme.contrast}
                        textColor={theme.textColor}
                        mutedTextColor={theme.oppositeTextColor}
                        onPress={() => navigation.navigate("LogsScreen")}
                    />

                    <Space height={16} />
                    <EventPicker
                        events={events}
                        activeEventId={form?.id}
                        textColor={theme.textColor}
                        mutedTextColor={theme.oppositeTextColor}
                        contrastColor={theme.contrast}
                        accentColor={theme.orange}
                        accentTextColor={theme.darker}
                        loading={loading}
                        onSelect={(eventId) => void openEvent(eventId)}
                    />

                    {form && (
                        <>
                            <Space height={16} />
                            <EventEditor
                                form={form}
                                theme={theme}
                                saving={saving}
                                onChange={setForm}
                                onSave={() => void saveEvent()}
                            />
                        </>
                    )}

                    <SummaryListCard title='Traffic targets' items={siteItems} theme={theme} />
                    <SummaryListCard title='Database clusters' items={clusterItems} theme={theme} />
                    <Space height={30} />
                </ScrollView>
            </View>
        </Swipe>
    )
}

function toEditableEvent(event: GetEventProps): EditableEventState {
    return {
        id: event.id,
        name_no: event.name_no,
        name_en: event.name_en,
        description_no: event.description_no,
        description_en: event.description_en,
        time_start: event.time_start,
        time_end: event.time_end,
        link_signup: event.link_signup || "",
        visible: event.visible,
        highlight: event.highlight,
        canceled: event.canceled,
    }
}
