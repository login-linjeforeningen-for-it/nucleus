import Cluster from '@components/shared/cluster'
import Space from '@components/shared/utils'
import DescriptionContent from '@components/event/descriptionContent'
import Markdown from '@components/course/markdown'
import CategorySquare from '@components/shared/category'
import DefaultBanner from '@components/event/defaultBanner'
import config from '@/constants'
import LastFetch from '@utils/fetch'
import T from '@styles/text'
import { Dimensions, Image, Linking, Pressable, Text, View } from 'react-native'
import { SvgUri } from 'react-native-svg'
import { useSelector } from 'react-redux'

type SpecificEventSectionsProps = {
    event: GetEventProps
}

export default function SpecificEventSections({ event }: SpecificEventSectionsProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const shortInfo = lang
        ? formatText(event.informational_no || event.informational_en)
        : formatText(event.informational_en || event.informational_no)
    const description = lang
        ? formatText(event.description_no || event.description_en)
        : formatText(event.description_en || event.description_no)
    const location = event.location
        ? (lang ? event.location.name_no || event.location.name_en : event.location.name_en || event.location.name_no)
        : (lang ? 'Ikke oppgitt' : 'Not specified')
    const audience = event.audience
        ? (lang ? event.audience.name_no || event.audience.name_en : event.audience.name_en || event.audience.name_no)
        : (lang ? 'Alle' : 'Everyone')
    const rule = event.rule
        ? (lang ? event.rule.description_no : event.rule.description_en)
        : ''
    const links = [
        { label: lang ? 'Meld meg på' : 'Join', url: event.link_signup || '', highlight: true },
        { label: 'Stream', url: event.link_stream || '' },
        { label: 'Discord', url: event.link_discord || '' },
        { label: 'Facebook', url: event.link_facebook || '' },
        { label: lang ? 'Nettside' : 'Website', url: event.organization?.link_homepage || '' },
        { label: lang ? 'Kart' : 'Map', url: getMazemapUrl(event) },
    ].filter((item) => item.url.length)

    return (
        <>
            <HeroMedia event={event} />
            <Space height={10} />
            <SectionCard title={lang ? 'Oversikt' : 'Overview'}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <MetaChip
                        label={lang ? 'Kategori' : 'Category'}
                        value={lang
                            ? event.category.name_no || event.category.name_en
                            : event.category.name_en || event.category.name_no}
                    />
                    <MetaChip
                        label={lang ? 'Arrangør' : 'Organizer'}
                        value={getOrganizerName(event, lang)}
                    />
                    <MetaChip
                        label={lang ? 'Sted' : 'Location'}
                        value={location}
                    />
                    <MetaChip
                        label={lang ? 'Plasser' : 'Capacity'}
                        value={formatCapacity(event, lang)}
                    />
                    <MetaChip
                        label={lang ? 'Publikum' : 'Audience'}
                        value={audience}
                    />
                    <MetaChip
                        label={lang ? 'Format' : 'Format'}
                        value={event.digital
                            ? (lang ? 'Digitalt' : 'Digital')
                            : (lang ? 'Fysisk' : 'In person')}
                    />
                </View>
            </SectionCard>
            {shortInfo ? (
                <>
                    <Space height={10} />
                    <SectionCard title={lang ? 'Kort fortalt' : 'In short'}>
                        <Text style={{ ...T.paragraph, color: '#fff', lineHeight: 22 }}>
                            {shortInfo}
                        </Text>
                    </SectionCard>
                </>
            ) : null}
            {description ? (
                <>
                    <Space height={10} />
                    <SectionCard title={lang ? 'Beskrivelse' : 'Description'}>
                        <DescriptionContent />
                    </SectionCard>
                </>
            ) : null}
            {rule ? (
                <>
                    <Space height={10} />
                    <SectionCard title={lang ? 'Regler' : 'Rules'}>
                        <Markdown fontSize={T.text15.fontSize} text={rule.replace(/\\n/g, '\n')} />
                    </SectionCard>
                </>
            ) : null}
            {links.length ? (
                <>
                    <Space height={10} />
                    <SectionCard title={lang ? 'Lenker' : 'Links'}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {links.map((item) => (
                                <ActionButton
                                    key={`${item.label}-${item.url}`}
                                    label={item.label}
                                    url={item.url}
                                    highlight={item.highlight}
                                />
                            ))}
                        </View>
                    </SectionCard>
                </>
            ) : null}
            <Space height={10} />
            <SectionCard title={lang ? 'Publisering' : 'Publishing'}>
                <View style={{ gap: 8 }}>
                    <Text style={{ ...T.text12, color: '#c8c8c8' }}>
                        {(lang ? 'Publisert' : 'Published') + `: ${LastFetch(event.time_publish)}`}
                    </Text>
                    <Text style={{ ...T.text12, color: '#c8c8c8' }}>
                        {(lang ? 'Oppdatert' : 'Updated') + `: ${LastFetch(event.updated_at)}`}
                    </Text>
                    <Text style={{ ...T.text12, color: '#c8c8c8' }}>
                        {`Event ID: ${event.id}`}
                    </Text>
                </View>
            </SectionCard>
        </>
    )
}

function resolveEventImageUrl(url: string | null | undefined) {
    if (!url) {
        return ''
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    return `${config.cdn}/events/${url.replace(/^\/+/, '')}`
}

function formatText(value: string | null | undefined) {
    return value ? value.replace(/\\n/g, '\n').trim() : ''
}

function formatEventDate(dateValue: string, lang: boolean) {
    return new Intl.DateTimeFormat(lang ? 'nb-NO' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(new Date(dateValue))
}

function formatEventTimeRange(start: string, end: string | null | undefined, lang: boolean) {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : null
    const date = formatEventDate(start, lang)
    const startTime = new Intl.DateTimeFormat(lang ? 'nb-NO' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(startDate)

    if (!endDate || Number.isNaN(endDate.valueOf())) {
        return `${date} • ${startTime}`
    }

    const endTime = new Intl.DateTimeFormat(lang ? 'nb-NO' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(endDate)

    return `${date} • ${startTime} - ${endTime}`
}

function formatCapacity(event: GetEventProps, lang: boolean) {
    if (!event.capacity) {
        return lang ? 'Ingen grense' : 'No limit'
    }

    if (event.is_full) {
        return lang ? `Fullt (${event.capacity})` : `Full (${event.capacity})`
    }

    return `${event.capacity}`
}

function getOrganizerName(event: GetEventProps, lang: boolean) {
    switch (event.organization?.shortname) {
        case 'board': return lang ? 'Styret' : 'The Board'
        case 'tekkom': return 'TekKom'
        case 'bedkom': return 'BedKom'
        case 'satkom': return 'SATkom'
        case 'evntkom': return 'EvntKom'
        case 'ctfkom': return 'CTFkom'
        case 's2g': return 'S2G'
        case 'idi': return 'IDI'
        default:
            return event.organization
                ? (lang
                    ? event.organization.name_no || event.organization.name_en
                    : event.organization.name_en || event.organization.name_no)
                : (lang
                    ? event.category.name_no || event.category.name_en
                    : event.category.name_en || event.category.name_no)
    }
}

function getMazemapUrl(event: GetEventProps) {
    const location = event.location
    const locationName = location?.name_no || location?.name_en || ''
    const organizer = event.organization?.shortname || event.organization?.name_en || ''

    if (!location || location.type !== 'mazemap') {
        return ''
    }

    if (locationName === 'Orgkollektivet') {
        return 'https://link.mazemap.com/tBlfH1oY'
    }

    if (organizer === 'HUSET') {
        return 'https://link.mazemap.com/O1OdhRU4'
    }

    if (location.mazemap_campus_id == null || location.mazemap_poi_id == null) {
        return ''
    }

    return 'https://use.mazemap.com/#v=1'
        + `&campusid=${location.mazemap_campus_id}`
        + `&sharepoitype=poi&sharepoi=${location.mazemap_poi_id}`
}

function SectionCard({
    title,
    children,
}: React.PropsWithChildren<{ title: string }>) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster marginHorizontal={12}>
            <View style={{ padding: 14 }}>
                <Text style={{ ...T.text18, color: theme.textColor, fontWeight: '700' }}>{title}</Text>
                <Space height={10} />
                {children}
            </View>
        </Cluster>
    )
}

function MetaChip({
    label,
    value,
}: {
    label: string
    value: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexBasis: '47%',
            flexGrow: 1,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#ffffff12',
            backgroundColor: '#ffffff08',
            padding: 12,
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor, marginBottom: 4 }}>
                {label}
            </Text>
            <Text style={{ ...T.text15, color: theme.textColor }}>
                {value}
            </Text>
        </View>
    )
}

function ActionButton({
    label,
    url,
    highlight,
}: {
    label: string
    url: string
    highlight?: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={() => void Linking.openURL(url)}
            style={{
                flexGrow: 1,
                minWidth: '30%',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: highlight ? theme.orange : '#ffffff14',
                backgroundColor: highlight ? theme.orange : '#ffffff08',
                paddingVertical: 10,
                paddingHorizontal: 12,
                alignItems: 'center',
            }}
        >
            <Text style={{
                ...T.text15,
                color: highlight ? theme.textColor : theme.oppositeTextColor,
                fontWeight: '600'
            }}>
                {label}
            </Text>
        </Pressable>
    )
}

function HeroMedia({ event }: SpecificEventSectionsProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const title = lang ? event.name_no || event.name_en : event.name_en || event.name_no
    const subtitle = formatEventTimeRange(event.time_start, event.time_end, lang)
    const bannerUrl = resolveEventImageUrl(event.image_banner || event.image_small)
    const width = Dimensions.get('window').width - 24
    const startDate = new Date(event.time_start)
    const endDate = event.time_type === 'default' ? new Date(event.time_end) : undefined

    return (
        <Cluster marginHorizontal={12}>
            <View style={{ padding: 14 }}>
                {bannerUrl ? (
                    bannerUrl.endsWith('.svg') ? (
                        <View style={{
                            borderRadius: 20,
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            paddingVertical: 12,
                            marginBottom: 14,
                        }}>
                            <SvgUri
                                width={width - 28}
                                height={(width - 28) / 2.4}
                                uri={bannerUrl}
                            />
                        </View>
                    ) : (
                        <Image
                            source={{ uri: bannerUrl, cache: 'force-cache' }}
                            style={{
                                width: '100%',
                                aspectRatio: 2.2,
                                borderRadius: 20,
                                backgroundColor: '#101010',
                                marginBottom: 14,
                            }}
                            resizeMode='cover'
                        />
                    )
                ) : (
                    <View style={{ marginBottom: 14 }}>
                        <DefaultBanner
                            category={event.category?.name_no || event.category?.name_en}
                            color={event.category?.color}
                            height={170}
                            borderRadius={18}
                        />
                    </View>
                )}
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <CategorySquare
                        color={event.category?.color}
                        startDate={startDate}
                        endDate={endDate}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ ...T.text20, color: theme.textColor, fontWeight: '700', marginBottom: 4 }}>
                            {title}
                        </Text>
                        <Text style={{ ...T.text12, color: theme.orange }}>
                            {subtitle}
                        </Text>
                    </View>
                </View>
            </View>
        </Cluster>
    )
}
