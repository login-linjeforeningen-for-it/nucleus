import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { copyToClipboard } from '@utils/general/clipboard'
import { Check } from 'lucide-react-native'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export function CopyableChip({ label, copyValue, color, backgroundColor }: {
    label: string
    copyValue: string
    color: string
    backgroundColor: string
}) {
    const [copied, setCopied] = useState(false)
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => () => {
        if (timeout.current) clearTimeout(timeout.current)
    }, [])

    function handleCopy() {
        copyToClipboard(copyValue)
        setCopied(true)
        if (timeout.current) clearTimeout(timeout.current)
        timeout.current = setTimeout(() => setCopied(false), 600)
    }

    return (
        <TouchableOpacity onPress={handleCopy} activeOpacity={0.82}>
            <View style={{ alignItems: 'center', borderRadius: 6, backgroundColor, flexDirection: 'row', gap: 5, paddingHorizontal: 7, paddingVertical: 4 }}>
                <Text style={{ ...T.text12, color, fontWeight: '700' }}>{label}</Text>
                {copied ? <Check color='#22c55e' size={12} strokeWidth={3} /> : null}
            </View>
        </TouchableOpacity>
    )
}

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor, width: 58 }}>{label}</Text>
            {children}
        </View>
    )
}

export function InfoChip({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <View style={{ borderRadius: 12, backgroundColor: '#ffffff08', borderWidth: 1, borderColor: '#ffffff12', paddingHorizontal: 10, paddingVertical: 7 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={2} />
            <Text style={{ ...T.text12, color: valueColor || theme.textColor, fontWeight: '700' }}>{value}</Text>
        </View>
    )
}

export function MetaPill({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <View style={{ borderRadius: 999, borderWidth: 1, borderColor: '#ffffff16', backgroundColor: '#ffffff08', paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
        </View>
    )
}

export function StatusPill({ label, active, subtle = false }: { label: string; active: boolean; subtle?: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: active ? theme.orangeTransparentBorderHighlighted : '#ffffff18',
            backgroundColor: active ? theme.orangeTransparentHighlighted : subtle ? '#ffffff08' : theme.contrast,
            paddingHorizontal: 10,
            paddingVertical: 5,
        }}>
            <Text style={{ ...T.text12, color: active ? theme.textColor : theme.oppositeTextColor }}>{label}</Text>
        </View>
    )
}
