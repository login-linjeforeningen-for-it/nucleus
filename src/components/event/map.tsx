import { TouchableOpacity, View, Text, Image, Linking, Alert } from 'react-native'
import { useSelector } from 'react-redux'
import ES from '@styles/eventStyles'
import T from '@styles/text'
import config from '@/constants'
import { EventContext } from '@utils/contextProvider'
import { useContext } from 'react'

type handleLinkProps = {
    mazemap_campus_id: number | null
    mazemap_poi_id: number | null
    locationName: string | undefined
    organizer: string
}

export default function Map() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    if (!event || !event.location || event.location?.type != 'mazemap' || !event.organization) {
        return <></>
    }

    const locationName = lang ? event.location.name_no : event.location?.name_en
    const organizer = event.organization?.shortname || event.organization?.name_en

    return (
        <TouchableOpacity
            style={{ minWidth: 70 }}
            onPress={() => {
                handleLink({
                    mazemap_campus_id: event.location?.mazemap_campus_id || 0,
                    mazemap_poi_id: event.location?.mazemap_poi_id || 0,
                    locationName,
                    organizer: organizer || ''
                })
            }}>
            <View style={ES.row}>
                <Text
                    style={{ ...T.specificEventInfo, color: theme.textColor }}>
                    {' - '}
                </Text>
                <Text style={{ ...T.mazemap, color: theme.orange }}>
                    {lang ? 'Kart' : 'Map'}
                </Text>
                <Image
                    style={ES.mazemapIcon}
                    source={require('@assets/icons/mazemap.png')} />
            </View>
        </TouchableOpacity>
    )
}

function handleLink({ mazemap_campus_id, mazemap_poi_id, locationName, organizer }: handleLinkProps) {
    const mailBody = `Send en mail til ${config.support_mail} dersom problemet vedvarer.`

    if (!locationName && (mazemap_campus_id === null || mazemap_poi_id === null)) {
        return
    }

    function open(url: string, errorTitle: string, errorBody: string) {
        Linking.openURL(url).catch(() => { Alert.alert(errorTitle, errorBody) })
    }


    if (locationName === 'Orgkollektivet') {
        open(
            'https://link.mazemap.com/tBlfH1oY',
            'Mazemap kunne ikke åpnes',
            `${mailBody} Feilkode: wZDe8byp`
        )
    }

    if (organizer === 'HUSET') {
        open(
            'https://link.mazemap.com/O1OdhRU4',
            'Mazemap kunne ikke åpnes.',
            `${mailBody} Feilkode: MGfrIBrd`
        )
    }

    open(
        'https://use.mazemap.com/#v=1'
        + `&campusid=${mazemap_campus_id}&sharepoitype=poi&sharepoi=${mazemap_poi_id}`,
        'Mazemap kunne ikke åpnes',
        `${mailBody} Feilkode: M${mazemap_campus_id},${mazemap_poi_id}`
    )
}
