import RenderDescription from '@components/ads/adDescription'
import Space from '@components/shared/utils'
import capitalizeFirstLetter from '@utils/general/capitalizeFirstLetter'
import SpecificAdHero from '@components/ads/specificAdHero'
import { ActionLinkButton, DetailSectionCard, MetaChip } from '@components/shared/detailSections'
import LastFetch from '@/utils/fetch'
import T from '@styles/text'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { formatList, formatText } from './specificAdUtils'

type SpecificAdSectionsProps = {
    ad: GetJobProps
}

export default function SpecificAdSections({ ad }: SpecificAdSectionsProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const unknownLabel = lang ? 'Ukjent' : 'Unknown'
    const shortDescription = lang
        ? formatText(ad.description_short_no || ad.description_short_en)
        : formatText(ad.description_short_en || ad.description_short_no)
    const longDescription = lang
        ? formatText(ad.description_long_no || ad.description_long_en)
        : formatText(ad.description_long_en || ad.description_long_no)
    const position = lang
        ? capitalizeFirstLetter(ad.position_title_no || ad.position_title_en)
        : capitalizeFirstLetter(ad.position_title_en || ad.position_title_no)
    const jobType = lang
        ? capitalizeFirstLetter(ad.job_type?.name_no || ad.job_type?.name_en)
        : capitalizeFirstLetter(ad.job_type?.name_en || ad.job_type?.name_no)
    const published = LastFetch(ad.time_publish)
    const updated = LastFetch(ad.updated_at)
    const deadline = LastFetch(ad.time_expire)
    const links = [
        { label: lang ? 'Søk' : 'Apply', url: ad.application_url || '', highlight: true },
        { label: lang ? 'Nettside' : 'Website', url: ad.organization?.link_homepage || '' },
        { label: 'LinkedIn', url: ad.organization?.link_linkedin || '' },
        { label: 'Instagram', url: ad.organization?.link_instagram || '' },
        { label: 'Facebook', url: ad.organization?.link_facebook || '' },
    ].filter((item) => item.url.length)

    return (
        <>
            <SpecificAdHero ad={ad} />
            <Space height={10} />
            <DetailSectionCard title={lang ? 'Oversikt' : 'Overview'}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <MetaChip label={lang ? 'Stilling' : 'Position'} value={position || unknownLabel} />
                    <MetaChip label={lang ? 'Type' : 'Type'} value={jobType || unknownLabel} />
                    <MetaChip label={lang ? 'Sted' : 'Location'} value={formatList(ad.cities) || unknownLabel} />
                    <MetaChip label={lang ? 'Frist' : 'Deadline'} value={deadline} />
                </View>
            </DetailSectionCard>
            <Space height={10} />
            {shortDescription ? (
                <>
                    <DetailSectionCard title={lang ? 'Kort fortalt' : 'In short'}>
                        <Text style={{ ...T.paragraph, color: '#fff', lineHeight: 22 }}>
                            {shortDescription}
                        </Text>
                    </DetailSectionCard>
                    <Space height={10} />
                </>
            ) : null}
            {Array.isArray(ad.skills) && ad.skills.length ? (
                <>
                    <DetailSectionCard title={lang ? 'Ferdigheter' : 'Skills'}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {ad.skills.map((skill) => (
                                <View
                                    key={skill}
                                    style={{
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: '#ffffff14',
                                        backgroundColor: '#ffffff08',
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                    }}
                                >
                                    <Text style={{ ...T.text12, color: '#fff' }}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </DetailSectionCard>
                    <Space height={10} />
                </>
            ) : null}
            {longDescription ? (
                <>
                    <DetailSectionCard title={lang ? 'Om stillingen' : 'About the position'}>
                        <RenderDescription description={longDescription} />
                    </DetailSectionCard>
                    <Space height={10} />
                </>
            ) : null}
            {links.length ? (
                <>
                    <DetailSectionCard title={lang ? 'Lenker' : 'Links'}>
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
                    <Space height={10} />
                </>
            ) : null}
            <DetailSectionCard title={lang ? 'Publisering' : 'Publishing'}>
                <View style={{ gap: 8 }}>
                    <Text style={{ ...T.text12, color: '#c8c8c8' }}>
                        {(lang ? 'Publisert' : 'Published') + `: ${published}`}
                    </Text>
                    <Text style={{ ...T.text12, color: '#c8c8c8' }}>
                        {(lang ? 'Oppdatert' : 'Updated') + `: ${updated}`}
                    </Text>
                    <Text style={{ ...T.text12, color: '#c8c8c8' }}>
                        {`Ad ID: ${ad.id}`}
                    </Text>
                </View>
            </DetailSectionCard>
        </>
    )
}
