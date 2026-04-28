import Space from '@/components/shared/utils'
import Cluster from '@components/shared/cluster'
import Text from '@components/shared/text'
import T from '@styles/text'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { NORWAY, haversineKilometers } from './mapUtils'
import { StatusBadge, SummaryCard } from './shared'
import { useTrafficMapState } from './useTrafficMapState'

export function TrafficSummary({ countryCount, requestCount, status }: { countryCount: number, requestCount: number, status: string }) {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <SummaryCard label='Active countries' value={String(countryCount)} />
            <SummaryCard label='Tracked requests' value={String(requestCount)} />
            <SummaryCard label='Status' value={status} />
        </View>
    )
}

export function TrafficRecordPreview({ record }: { record: TrafficRecord }) {
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

export function TrafficCountrySummary({
    selectedCountry,
    mapState,
}: {
    selectedCountry: string
    mapState: ReturnType<typeof useTrafficMapState>
}) {
    return (
        <>
            <Space height={10} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                <SummaryCard label={`Country · ${selectedCountry}`} value={String(mapState.selectedPoint?.count || 0)} detail='Requests observed' />
                <SummaryCard label='Live share' value={mapState.selectedShare ? `${mapState.selectedShare}%` : '—'} detail={`Rank ${mapState.selectedRank || '—'}`} />
                <SummaryCard label='Oslo distance' value={mapState.selectedCoords ? `${haversineKilometers(mapState.selectedCoords, NORWAY)} km` : '—'} />
            </View>
            <Space height={10} />
        </>
    )
}
