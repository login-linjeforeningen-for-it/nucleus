import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import { useMemo } from 'react'
import { Image, Linking, TouchableOpacity, View } from 'react-native'
import Svg, { Circle, Polyline } from 'react-native-svg'
import { useSelector } from 'react-redux'
import { formatCurrency, formatSignedCurrency, InfoLine } from './fundPrimitives'
import { FundBoardMember, FundBoardText, FundSection, FundSupportText, HoldingsCardProps } from './fundTypes'

export function FundSupportCard({ text, lang }: { text: FundSupportText, lang: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{text.title}</Text>
                <Space height={8} />
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.intro}</Text>
                <Space height={10} />
                <InfoLine label={lang ? 'Målgruppe' : 'Target group'} value={text.target} />
                <InfoLine label={lang ? 'Søknadsperiode' : 'Application period'} value={text.period} />
                <InfoLine label={lang ? 'Slik søker du' : 'How to apply'} value={text.apply} />
                <Space height={8} />
                <TouchableOpacity onPress={() => void Linking.openURL('mailto:fondet@login.no')} activeOpacity={0.88}>
                    <View style={{
                        borderRadius: 999,
                        backgroundColor: theme.orange,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        alignSelf: 'flex-start',
                    }}>
                        <Text style={{ ...T.text15, color: theme.textColor, fontWeight: '600' }}>
                            fondet@login.no
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Cluster>
    )
}

export function HoldingsCard({ holdings, history, text }: HoldingsCardProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const points = history?.points || []
    const first = points[0]
    const last = points[points.length - 1]
    const delta = first && last ? last.totalBase - first.totalBase : null

    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{text.title}</Text>
                <Space height={6} />
                <Text style={{ ...T.text25, color: theme.orange }}>
                    {holdings ? formatCurrency(holdings.totalBase) : '...'}
                </Text>
                {holdings?.updatedAt ? (
                    <>
                        <Space height={4} />
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            {`${text.updated}: ${new Date(holdings.updatedAt).toLocaleTimeString('nb-NO')}`}
                        </Text>
                    </>
                ) : null}
                <Space height={14} />
                <Text style={{ ...T.text15, color: theme.textColor }}>{text.history}</Text>
                <Space height={8} />
                {points.length ? (
                    <>
                        <HistoryLine points={points} />
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {`${text.change}: ${delta === null ? '...' : formatSignedCurrency(delta)}`}
                        </Text>
                    </>
                ) : (
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.empty}</Text>
                )}
            </View>
        </Cluster>
    )
}

export function SectionCard({ section }: { section: FundSection }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{section.title}</Text>
                    <Space height={6} />
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{section.body}</Text>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

export function BoardCard({ text }: { text: FundBoardText }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{text.title}</Text>
                <Space height={8} />
                <Image
                    source={{ uri: `${config.cdn}/img/fund/group.jpg`, cache: 'force-cache' }}
                    style={{ width: '100%', height: 190, borderRadius: 18, backgroundColor: theme.contrast }}
                />
                <Space height={10} />
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.intro}</Text>
                <Space height={6} />
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.body}</Text>
                <Space height={12} />
                <Text style={{ ...T.text15, color: theme.textColor }}>{text.membersTitle}</Text>
                <Space height={8} />
                {text.members.map((member) => (
                    <BoardMember key={`${member.title}-${member.name || member.discord}`} member={member} />
                ))}
            </View>
        </Cluster>
    )
}

function HistoryLine({ points }: { points: FundHoldingsHistoryPoint[] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const chart = useMemo(() => {
        const width = 310
        const height = 116
        const values = points.map((point) => point.totalBase)
        const min = Math.min(...values)
        const max = Math.max(...values)
        const spread = max - min || 1
        const x = (index: number) => points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
        const y = (value: number) => 12 + ((max - value) / spread) * (height - 24)
        const coordinates = points.map((point, index) => ({ x: x(index), y: y(point.totalBase) }))

        return { width, height, coordinates }
    }, [points])

    const line = chart.coordinates.map((point) => `${point.x},${point.y}`).join(' ')
    const last = chart.coordinates[chart.coordinates.length - 1]

    return (
        <View style={{ borderRadius: 18, borderWidth: 1, borderColor: '#ffffff14', backgroundColor: theme.contrast, padding: 10 }}>
            <Svg viewBox={`0 0 ${chart.width} ${chart.height}`} width='100%' height={chart.height}>
                <Polyline points={line} fill='none' stroke={theme.orange} strokeWidth={3} strokeLinecap='round' strokeLinejoin='round' />
                {last ? <Circle cx={last.x} cy={last.y} r={5} fill={theme.orange} /> : null}
            </Svg>
        </View>
    )
}

function BoardMember({ member }: { member: FundBoardMember }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const name = member.name || member.title

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#ffffff10', paddingVertical: 10 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: theme.contrast, alignItems: 'center', justifyContent: 'center' }}>
                {member.image ? <Image source={{ uri: `${config.cdn}/img/fund/${member.image}`, cache: 'force-cache' }} style={{ width: 48, height: 48 }} />
                    : <Text style={{ ...T.text15, color: theme.orange }}>{name.slice(0, 1)}</Text>}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ ...T.text15, color: theme.textColor }}>{name}</Text>
                <Space height={2} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    {`${member.title}${member.discord ? ` · ${member.discord}` : ''}`}
                </Text>
            </View>
        </View>
    )
}
