import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { formatAdditionAction, formatSourceLabel } from '@utils/general'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { IconBadge, QueenbeeIcon, QueenbeeIconName } from './queenbeeIcon'

export default function DashboardSummary({ data }: { data: NativeDashboardSummary | null }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!data) {
        return null
    }

    return (
        <>
            <Space height={14} />
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>Dashboard</Text>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Metric icon='calendar' label='Events' value={data.counts.events} />
                        <Metric icon='briefcase' label='Jobs' value={data.counts.jobs} />
                    </View>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Metric icon='building' label='Organizations' value={data.counts.organizations} />
                        <Metric icon='image' label='Albums' value={data.counts.albums} />
                    </View>
                    <Space height={12} />
                    <CategoryList categories={data.categories} />
                    <Space height={12} />
                    {data.additions.map(addition => (
                        <RecentAdditionRow key={addition.id} addition={addition} />
                    ))}
                </View>
            </Cluster>
        </>
    )
}

function Metric({
    icon,
    label,
    value,
}: {
    icon: QueenbeeIconName
    label: string
    value: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flex: 1,
            borderRadius: 16,
            backgroundColor: theme.contrast,
            padding: 12,
            gap: 8,
        }}>
            <IconBadge name={icon} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Text style={{ ...T.text20, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function CategoryList({ categories }: { categories: NativeDashboardSummary['categories'] }) {
    return (
        <View style={{ gap: 8 }}>
            {categories.map((category) => (
                <CategoryRow
                    key={category.id}
                    label={category.name_en}
                    value={category.event_count}
                    showDivider
                />
            ))}
        </View>
    )
}

function CategoryRow({
    label,
    value,
    showDivider = false,
}: {
    label: string
    value: number
    showDivider?: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: showDivider ? 1 : 0,
            borderBottomColor: '#ffffff12',
            paddingHorizontal: 12,
            paddingVertical: 10,
        }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <QueenbeeIcon name='tag' size={15} color={theme.orange} />
                <Text style={{ ...T.text15, color: theme.textColor, flex: 1 }}>
                    {label}
                </Text>
            </View>
            <Text style={{ ...T.text15, color: theme.textColor }}>
                {value}
            </Text>
        </View>
    )
}

function RecentAdditionRow({ addition }: { addition: NativeDashboardSummary['additions'][number] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderTopWidth: 1,
            borderTopColor: '#ffffff12',
            paddingTop: 10,
            gap: 8,
        }}>
            <Text style={{ ...T.text15, color: theme.textColor }}>{addition.name_en}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Text style={{
                    ...T.text12,
                    color: theme.textColor,
                    backgroundColor: theme.orangeTransparent,
                    borderRadius: 999,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    overflow: 'hidden',
                }}>
                    {formatSourceLabel(addition.source)}
                </Text>
                <Text style={{
                    ...T.text12,
                    color: theme.oppositeTextColor,
                    backgroundColor: '#ffffff12',
                    borderRadius: 999,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    overflow: 'hidden',
                }}>
                    {formatAdditionAction(addition.action)}
                </Text>
            </View>
        </View>
    )
}
