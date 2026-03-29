import Card from "@components/shared/card"
import ES from "@styles/eventStyles"
import { Text, View } from "react-native"
import { GetEndTime } from "./time"
import Category from "./category"
import Map from "./map"
import T from "@styles/text"
import { useSelector } from "react-redux"
import { TextLink } from "@components/shared/link"
import InfoBlock from "@components/shared/infoBlock"
import Skeleton from "@components/shared/skeleton"
import { EventContext } from "@utils/contextProvider"
import { useContext } from "react"

export default function BasicInfo() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    const loading = !event || !Object.keys(event).length
    let text = { host: '', more: '' }, info = ''

    if (event && Object.keys(event).length) {
        const textNO = { host: "Arrangør:   ", more: "Mer info" }
        const textEN = { host: "Organizer:   ", more: "More info" }
        text = lang ? textNO : textEN
        info = lang ? event.informational_no : event.informational_en
    }

    const host = findOrgName()
    function findOrgName() {
        if (!event || !('organization' in event)) {
            return ""
        }

        switch (event.organization?.shortname) {
            case 'board': return lang ? 'Styret' : 'The Board'
            case 'tekkom': return 'TekKom'
            case 'bedkom': return 'BedKom'
            case 'satkom': return 'SATkom'
            case 'evntkom': return 'EvntKom'
            case 'ctfkom': return 'CTFkom'
            case 's2g': return 'S2G'
            case 'idi': return 'IDI'
            default: return event.organization?.shortname || lang
                ? event.category.name_no || event.category.name_en
                : event.category.name_en || event.category.name_no
        }
    }

    return (
        <Card>
            <Skeleton height={140} loading={loading}>
                <Start />
                <End />
                <Location />
                <Category />
                <View style={ES.specificEventInfoView}>
                    <Text style={{ ...T.specificEventInfo, color: theme.textColor }}>{text.host}</Text>
                    <Text style={{ ...T.specificEventInfoContent, color: theme.textColor }}>
                        {host}
                        {event && 'link_stream' in event && ' - '}
                        {event && 'link_stream' in event && <TextLink style={{ ...T.text20, color: "#fd8738", top: 3 }} text="Stream" url={event.link_stream!} />}
                        {event && 'link_discord' in event && ' - '}
                        {event && 'link_discord' in event && <TextLink style={{ ...T.text20, color: "#fd8738", top: 3 }} text="Discord" url={event.link_discord!} />}
                        {event && 'link_facebook' in event && ' - '}
                        {event && 'link_facebook' in event && <TextLink style={{ ...T.text20, color: "#fd8738", top: 3 }} text="Facebook" url={event.link_facebook!} />}
                        {event && 'organization' in event && event.organization?.link_homepage && ' - '}
                        {event && 'organization' in event && event.organization?.link_homepage && <TextLink style={{ ...T.text20, color: "#fd8738", top: 3 }} text={text.more} url={event.organization?.link_homepage} />}
                    </Text>
                </View>
                <>{info && <InfoBlock text={info} />}</>
            </Skeleton>
        </Card>
    )
}

function Start() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const start = lang ? "Starter:      " : "Starts:         "

    if (!event || !Object.keys(event).length) {
        return null
    }

    return (
        <View style={ES.specificEventInfoView}>
            <Text style={{ ...T.specificEventInfo, color: theme.textColor }}>
                {start}
            </Text>
            <Text style={{ ...T.specificEventInfo, color: theme.textColor }}>
                {event.time_start[11]}{event.time_start[12]}:
                {event.time_start[14]}{event.time_start[15]}
            </Text>
        </View>
    )
}

function End() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const end = lang ? "Slutter:       " : "Ends:           "

    return (
        <View style={ES.specificEventInfoView}>
            <Text style={{ ...T.specificEventInfo, color: theme.textColor }}>
                {end}
            </Text>
            {event != undefined && <GetEndTime time_end={event.time_end} />}
        </View>
    )
}

function Location() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    if (!event || !('location' in event)) {
        return <></>
    }

    const text = lang ? "Lokasjon:   " : "Location:     "

    // Uses best available location
    const location = lang
        ? event.location?.name_no || event.location?.name_en
        : event.location?.name_en || event.location?.name_no

    return (
        <View style={{
            flexDirection: "row",
            maxWidth: '100%',
            overflow: 'hidden',
            flexWrap: 'wrap',
            top: -5
        }}>
            <Text style={{ ...T.specificEventInfo, color: theme.textColor }}>
                {text}{location || 'TBA!'}
                <Map />
            </Text>
        </View>
    )
}
