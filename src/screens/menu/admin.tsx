import Space from "@/components/shared/utils"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import { JSX, useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    ScrollView,
    Switch,
    TextInput,
    TouchableOpacity,
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
} from "@utils/adminApi"
import { startLogin } from "@utils/auth"

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

export default function AdminScreen(): JSX.Element {
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

    const canAdmin = useMemo(() =>
        groups.map(group => group.toLowerCase()).includes("queenbee"),
    [groups])

    useEffect(() => {
        if (!login || !canAdmin) {
            return
        }

        void refresh()
    }, [login, canAdmin])

    async function refresh() {
        try {
            setLoading(true)
            setError(null)
            const [eventsPayload, systemPayload, sitesPayload, databasePayload, vulnerabilityPayload] = await Promise.all([
                listProtectedEvents(20),
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
            setError(err instanceof Error ? err.message : "Failed to load admin tools.")
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
            <ScrollView>
                <Swipe left="MenuScreen">
                    <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                        <Space height={80} />
                        <Text style={{ ...T.centeredBold20, color: theme.textColor }}>Admin Tools</Text>
                        <Space height={14} />
                        <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                            Sign in to edit events, review internal health, and use Queenbee workflows in the app.
                        </Text>
                        <Space height={20} />
                        <TouchableOpacity onPress={() => startLogin("queenbee")}>
                            <View style={{ borderRadius: 18, backgroundColor: theme.orange, padding: 14 }}>
                                <Text style={{ ...T.centered20, color: theme.darker }}>Sign in for admin</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Swipe>
            </ScrollView>
        )
    }

    if (!canAdmin) {
        return (
            <ScrollView>
                <Swipe left="MenuScreen">
                    <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                        <Space height={80} />
                        <Text style={{ ...T.centeredBold20, color: theme.textColor }}>Admin Tools</Text>
                        <Space height={14} />
                        <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                            Your account is signed in, but it does not currently have Queenbee or TekKom access.
                        </Text>
                    </View>
                </Swipe>
            </ScrollView>
        )
    }

    return (
        <ScrollView>
            <Swipe left="MenuScreen">
                <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                    <Space height={70} />
                    <Text style={{ ...T.centeredBold20, color: theme.textColor }}>Admin Tools</Text>
                    <Space height={10} />
                    <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                        Native Queenbee and internal workflows for quick changes on the go.
                    </Text>
                    <Space height={16} />
                    {loading && <ActivityIndicator color={theme.orange} />}
                    {error && <Text style={{ ...T.centered15, color: "red" }}>{error}</Text>}
                    {success && <Text style={{ ...T.centered15, color: theme.orange }}>{success}</Text>}

                    <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>Internal status</Text>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {system
                                ? `${system.containers} containers · ${system.load} load · ${system.ram}`
                                : "Internal metrics unavailable right now."}
                        </Text>
                    </View>

                    <Space height={10} />
                    <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>Load balancing</Text>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {primarySite
                                ? `Primary ${primarySite.name} · ${healthySites}/${sites.length} healthy`
                                : "Load balancing data unavailable right now."}
                        </Text>
                    </View>

                    <Space height={10} />
                    <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>Databases</Text>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {databaseOverview
                                ? `${databaseOverview.clusterCount} clusters · ${databaseOverview.databaseCount} databases · ${databaseOverview.activeQueries} active queries`
                                : "Database overview unavailable right now."}
                        </Text>
                    </View>

                    <Space height={10} />
                    <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>Vulnerabilities</Text>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {vulnerabilities
                                ? `${vulnerabilities.imageCount} images · ${vulnerabilities.images.reduce((sum, image) => sum + image.totalVulnerabilities, 0)} findings`
                                : "Vulnerability overview unavailable right now."}
                        </Text>
                    </View>

                    <Space height={16} />
                    <Text style={{ ...T.text20, color: theme.textColor }}>Queenbee events</Text>
                    <Space height={8} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            {events.map(event => (
                                <TouchableOpacity key={event.id} onPress={() => void openEvent(event.id)}>
                                    <View style={{
                                        borderRadius: 14,
                                        backgroundColor: form?.id === event.id ? theme.orange : theme.contrast,
                                        paddingHorizontal: 12,
                                        paddingVertical: 10,
                                        width: 220
                                    }}>
                                        <Text style={{ ...T.text15, color: form?.id === event.id ? theme.darker : theme.textColor }}>
                                            {event.name_no}
                                        </Text>
                                        <Text style={{ ...T.text12, color: form?.id === event.id ? theme.darker : theme.oppositeTextColor }}>
                                            {event.time_start}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {form && (
                        <>
                            <Space height={16} />
                            <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                                <Text style={{ ...T.text20, color: theme.textColor }}>Edit event</Text>
                                <Space height={12} />
                                {[
                                    ["Norwegian title", "name_no"],
                                    ["English title", "name_en"],
                                    ["Start", "time_start"],
                                    ["End", "time_end"],
                                    ["Signup link", "link_signup"],
                                ].map(([label, key]) => (
                                    <View key={key} style={{ marginBottom: 10 }}>
                                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
                                        <TextInput
                                            value={String(form[key as keyof EditableEventState] ?? "")}
                                            onChangeText={(value) => setForm(prev => prev ? { ...prev, [key]: value } : prev)}
                                            placeholderTextColor={theme.oppositeTextColor}
                                            style={{
                                                marginTop: 6,
                                                borderRadius: 14,
                                                borderWidth: 1,
                                                borderColor: theme.background,
                                                backgroundColor: theme.background,
                                                color: theme.textColor,
                                                paddingHorizontal: 12,
                                                paddingVertical: 10
                                            }}
                                        />
                                    </View>
                                ))}
                                {[
                                    ["Norwegian description", "description_no"],
                                    ["English description", "description_en"],
                                ].map(([label, key]) => (
                                    <View key={key} style={{ marginBottom: 10 }}>
                                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
                                        <TextInput
                                            multiline
                                            value={String(form[key as keyof EditableEventState] ?? "")}
                                            onChangeText={(value) => setForm(prev => prev ? { ...prev, [key]: value } : prev)}
                                            placeholderTextColor={theme.oppositeTextColor}
                                            style={{
                                                marginTop: 6,
                                                borderRadius: 14,
                                                borderWidth: 1,
                                                borderColor: theme.background,
                                                backgroundColor: theme.background,
                                                color: theme.textColor,
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                minHeight: 120,
                                                textAlignVertical: "top"
                                            }}
                                        />
                                    </View>
                                ))}
                                {[
                                    ["Visible", "visible"],
                                    ["Highlighted", "highlight"],
                                    ["Canceled", "canceled"],
                                ].map(([label, key]) => (
                                    <View key={key} style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 10
                                    }}>
                                        <Text style={{ ...T.text15, color: theme.textColor }}>{label}</Text>
                                        <Switch
                                            value={Boolean(form[key as keyof EditableEventState])}
                                            onValueChange={(value) => setForm(prev => prev ? { ...prev, [key]: value } : prev)}
                                            trackColor={{ false: theme.background, true: theme.orange }}
                                        />
                                    </View>
                                ))}
                                <TouchableOpacity onPress={() => void saveEvent()}>
                                    <View style={{
                                        borderRadius: 16,
                                        backgroundColor: theme.orange,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12
                                    }}>
                                        <Text style={{ ...T.centered20, color: theme.darker }}>
                                            {saving ? "Saving..." : "Save event"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {!!sites.length && (
                        <>
                            <Space height={16} />
                            <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                                <Text style={{ ...T.text20, color: theme.textColor }}>Traffic targets</Text>
                                <Space height={10} />
                                {sites.map((site, index) => (
                                    <View
                                        key={`${site.name}-${index}`}
                                        style={{
                                            paddingVertical: 8,
                                            borderBottomWidth: index === sites.length - 1 ? 0 : 1,
                                            borderBottomColor: theme.darker,
                                        }}
                                    >
                                        <Text style={{ ...T.text15, color: theme.textColor }}>
                                            {site.name}{site.primary ? " · primary" : ""}
                                        </Text>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                            {site.operational ? "Operational" : "Down"}{site.maintenance ? " · maintenance" : ""}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {databaseOverview && (
                        <>
                            <Space height={16} />
                            <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                                <Text style={{ ...T.text20, color: theme.textColor }}>Database clusters</Text>
                                <Space height={10} />
                                {databaseOverview.clusters.map((cluster, index) => (
                                    <View
                                        key={cluster.id}
                                        style={{
                                            paddingVertical: 8,
                                            borderBottomWidth: index === databaseOverview.clusters.length - 1 ? 0 : 1,
                                            borderBottomColor: theme.darker,
                                        }}
                                    >
                                        <Text style={{ ...T.text15, color: theme.textColor }}>
                                            {cluster.name}
                                        </Text>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                            {cluster.databaseCount} databases · {cluster.activeQueries} active queries
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                    <Space height={30} />
                </View>
            </Swipe>
        </ScrollView>
    )
}
