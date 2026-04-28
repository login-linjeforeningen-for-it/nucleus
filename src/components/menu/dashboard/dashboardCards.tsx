import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { formatAdditionAction, formatSourceLabel } from '@utils/general'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

export function DashboardMetrics({ counts }: { counts: NativeDashboardSummary['counts'] }) {
    return (
        <Cluster>
            <View style={{ padding: 5, flexDirection: 'row', gap: 10 }}>
                <Metric label='Events' value={counts.events} />
                <Metric label='Jobs' value={counts.jobs} />
            </View>
            <View style={{ padding: 5, flexDirection: 'row', gap: 10 }}>
                <Metric label='Organizations' value={counts.organizations} />
                <Metric label='Albums' value={counts.albums} />
            </View>
        </Cluster>
    )
}

export function CategoryList({ categories }: { categories: NativeDashboardSummary['categories'] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ borderWidth: 1, borderColor: '#ffffff18', borderRadius: 14, backgroundColor: theme.contrast, overflow: 'hidden' }}>
            {categories.map((item, index) => (
                <CategoryRow
                    key={item.id}
                    label={item.name_en}
                    value={item.event_count}
                    showDivider={index !== categories.length - 1}
                />
            ))}
        </View>
    )
}

export function RecentAdditionRow({ item, showDivider }: {
    item: NativeDashboardSummary['additions'][number]
    showDivider: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ paddingVertical: 10, borderBottomWidth: showDivider ? 1 : 0, borderBottomColor: '#ffffff10' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>{item.name_en}</Text>
                    <Space height={5} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {formatSourceLabel(item.source, 'Unknown')}
                    </Text>
                </View>
                <View style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: item.action === 'created' ? theme.orangeTransparentBorder : theme.orangeTransparentBorderHighlighted,
                    backgroundColor: item.action === 'created' ? theme.orangeTransparent : theme.orangeTransparentHighlighted,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    alignSelf: 'center',
                }}>
                    <Text style={{ ...T.text12, color: item.action === 'created' ? theme.textColor : theme.oppositeTextColor }}>
                        {formatAdditionAction(item.action)}
                    </Text>
                </View>
            </View>
        </View>
    )
}

function Metric({ label, value }: { label: string, value: number }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ minWidth: '47%', borderWidth: 1, borderColor: '#ffffff18', borderRadius: 14, backgroundColor: theme.contrast, padding: 12 }}>
            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={4} />
            <Text style={{ ...T.text25, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function CategoryRow({ label, value, showDivider }: { label: string, value: number, showDivider: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            borderBottomWidth: showDivider ? 1 : 0,
            borderBottomColor: '#ffffff12',
            paddingHorizontal: 12,
            paddingVertical: 10,
        }}>
            <Text style={{ ...T.text15, color: theme.textColor, flex: 1 }}>{label}</Text>
            <Text style={{ ...T.text15, color: theme.textColor }}>{value}</Text>
        </View>
    )
}
