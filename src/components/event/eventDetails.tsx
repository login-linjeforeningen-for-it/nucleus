import Space from '@components/shared/utils'
import Markdown from '@components/course/markdown'
import Embed from '@components/event/embed'
import SpecificEventHero from '@components/event/specificEventHero'
import { ActionLinkButton, DetailSectionCard, MetaChip } from '@components/shared/detailSections'
import LastFetch from '@utils/fetch'
import T from '@styles/text'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { formatEscapedText } from '@utils/general'
import { formatCapacity, getMazemapUrl, getOrganizerName } from './specificEventUtils'
import ReactMarkdown from 'react-native-markdown-display'

type EventDetailsProps = {
    event: GetEventProps
}

function DescriptionContent({ event }: EventDetailsProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const description = lang
        ? event.description_no || event.description_en
        : event.description_en || event.description_no

    const embededEvent = /(\[:\w+\]\(\d+\))/
    const findNumber = /\((\d+)\)/
    const split = description.replace(/\\n/g, '<br>').split(embededEvent)

    return split.map((content, index) => {
        const sliced = content.slice(0, 50000)
        const match = sliced.match(findNumber)
        const number = match ? Number(match[1]) : null
        const markdown = sliced.replace(/<br>/g, '\n').replace(/###/g, '')

        if (!sliced.includes('[:event]') && !sliced.includes('[:jobad]')) {
            return <ReactMarkdown key={index} style={{ text: { color: theme.textColor } }}>{markdown}</ReactMarkdown>
        }

        return <Embed
            key={index}
            id={number}
            type={sliced.includes('[:event]') ? 'event' : 'ad'}
        />
    })
}

export default function EventDetails({ event }: EventDetailsProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const shortInfo = lang
        ? formatEscapedText(event.informational_no || event.informational_en)
        : formatEscapedText(event.informational_en || event.informational_no)
    const description = lang
        ? formatEscapedText(event.description_no || event.description_en)
        : formatEscapedText(event.description_en || event.description_no)
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
            <SpecificEventHero event={event} />
            <Space height={10} />
            <DetailSectionCard title={lang ? 'Oversikt' : 'Overview'} flush>
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
            </DetailSectionCard>
            {shortInfo ? (
                <>
                    <Space height={10} />
                    <DetailSectionCard title={lang ? 'Kort fortalt' : 'In short'} flush>
                        <Text style={{ ...T.paragraph, color: '#fff', lineHeight: 22 }}>
                            {shortInfo}
                        </Text>
                    </DetailSectionCard>
                </>
            ) : null}
            {description ? (
                <>
                    <Space height={10} />
                    <DetailSectionCard title={lang ? 'Beskrivelse' : 'Description'} flush>
                        <DescriptionContent event={event} />
                    </DetailSectionCard>
                </>
            ) : null}
            {rule ? (
                <>
                    <Space height={10} />
                    <DetailSectionCard title={lang ? 'Regler' : 'Rules'} flush>
                        <Markdown fontSize={T.text15.fontSize} text={rule.replace(/\\n/g, '\n')} />
                    </DetailSectionCard>
                </>
            ) : null}
            {links.length ? (
                <>
                    <Space height={10} />
                    <DetailSectionCard title={lang ? 'Lenker' : 'Links'} flush>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {links.map((item) => (
                                <ActionLinkButton
                                    key={`${item.label}-${item.url}`}
                                    label={item.label}
                                    url={item.url}
                                    highlight={item.highlight}
                                />
                            ))}
                        </View>
                    </DetailSectionCard>
                </>
            ) : null}
            <Space height={10} />
            <DetailSectionCard title={lang ? 'Publisering' : 'Publishing'} flush>
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
            </DetailSectionCard>
        </>
    )
}
