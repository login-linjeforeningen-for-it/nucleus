import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import { cleanMarkdown, formatContentDate } from '@utils/content/content'
import { Image, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export function LoadMoreButton({ label, onPress }: { label: string; onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
            <Cluster>
                <View style={{ padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.orangeTransparentBorderHighlighted, backgroundColor: theme.orangeTransparent }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>{label}</Text>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}

export function TabPill({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
            <View style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? theme.orangeTransparentBorderHighlighted : '#ffffff18',
                backgroundColor: active ? theme.orangeTransparentHighlighted : theme.contrast,
                paddingHorizontal: 11,
                paddingVertical: 7,
            }}>
                <Text style={{ ...T.text12, color: active ? theme.textColor : theme.oppositeTextColor }}>{label}</Text>
            </View>
        </TouchableOpacity>
    )
}

export function ContentCard({ title, subtitle, body }: { title: string, subtitle: string, body: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster style={{ borderWidth: 1, borderColor: theme.greyTransparentBorder, backgroundColor: theme.greyTransparent, borderRadius: 18 }}>
                <View style={{ padding: 14, borderLeftWidth: 2, borderLeftColor: theme.orangeTransparentBorderHighlighted }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                    <Space height={4} />
                    <SubtitleLine subtitle={subtitle} />
                    <Space height={8} />
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor, lineHeight: 21 }}>{cleanMarkdown(body)}</Text>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

export function OrganizationCard({ organization, lang, updatedLabel }: {
    organization: WorkerbeeOrganization
    lang: boolean
    updatedLabel: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const logo = organization.logo ? `${config.cdn}/img/organizations/${organization.logo}` : ''
    const name = lang ? organization.name_no : organization.name_en

    return (
        <>
            <Cluster>
                <View style={{ padding: 12, flexDirection: 'row', gap: 12 }}>
                    <View style={{ width: 54, height: 54, borderRadius: 16, overflow: 'hidden', backgroundColor: theme.contrast, alignItems: 'center', justifyContent: 'center' }}>
                        {logo ? <Image source={{ uri: logo, cache: 'force-cache' }} style={{ width: 54, height: 54 }} /> : <Text style={{ ...T.text15, color: theme.orange }}>{name.slice(0, 1)}</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>{name}</Text>
                        <Space height={4} />
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{`#${organization.id} · ${updatedLabel} ${formatContentDate(organization.updated_at)}`}</Text>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }} numberOfLines={5}>
                            {lang ? organization.description_no : organization.description_en}
                        </Text>
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

export function EmptyContent({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return <Cluster><View style={{ padding: 18, alignItems: 'center' }}><Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text></View></Cluster>
}

function SubtitleLine({ subtitle }: { subtitle: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [idPart, ...rest] = subtitle.split(' · ')

    return (
        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
            <Text style={{ ...T.text12, color: theme.orange, fontWeight: '700' }}>{idPart}</Text>
            {rest.length ? ` · ${rest.join(' · ')}` : ''}
        </Text>
    )
}
