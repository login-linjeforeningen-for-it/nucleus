import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { StatusBadge } from './shared'

export default function TrafficRecordPreview({ record }: { record: TrafficRecord }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster style={{
            borderWidth: 1,
            borderColor: theme.greyTransparentBorder,
            backgroundColor: theme.greyTransparent,
        }}>
            <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                    <Text style={{ ...T.text15, color: theme.textColor, flex: 1 }} numberOfLines={1}>
                        {`${record.method} ${record.path}`}
                    </Text>
                    <StatusBadge status={record.status} />
                </View>
                <Space height={6} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    {`${record.domain} · ${record.request_time}ms`}
                </Text>
            </View>
        </Cluster>
    )
}
