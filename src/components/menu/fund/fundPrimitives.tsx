import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

export function InfoLine({ label, value }: { label: string, value: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ marginBottom: 8 }}>
            <Text style={{ ...T.text12, color: theme.orange }}>{label}</Text>
            <Space height={3} />
            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{value}</Text>
        </View>
    )
}

export function formatCurrency(value: number) {
    return `${new Intl.NumberFormat('nb-NO', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(value)} NOK`
}

export function formatSignedCurrency(value: number) {
    return `${value >= 0 ? '+' : ''}${formatCurrency(value)}`
}
