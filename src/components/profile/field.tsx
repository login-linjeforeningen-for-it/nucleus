import T from '@styles/text'
import { copyToClipboard } from '@utils/general/clipboard'
import { BadgeCheck, Check, Copy } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export function Field({
    theme,
    title,
    text,
    copyValue,
    verified,
    wrapEvery
}: {
    theme: Theme
    title: string
    text: string
    copyValue?: string
    verified?: boolean
    wrapEvery?: number
}) {
    const [copied, setCopied] = useState(false)
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const displayText = wrapEvery ? chunkText(text, wrapEvery) : text

    useEffect(() => () => {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
    }, [])

    function handleCopy() {
        if (!copyValue) {
            return
        }

        copyToClipboard(copyValue)
        setCopied(true)

        if (timeout.current) {
            clearTimeout(timeout.current)
        }

        timeout.current = setTimeout(() => setCopied(false), 600)
    }

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 18,
            width: '100%'
        }}>
            <Text style={{ ...T.text15, color: theme.oppositeTextColor, flex: 1 }}>
                {title}
            </Text>
            <View style={{
                alignItems: 'flex-end',
                flex: 1.35,
                flexDirection: 'row',
                gap: 8,
                justifyContent: 'flex-end'
            }}>
                <Text style={{ ...T.text15, color: theme.textColor, flex: 1, textAlign: 'right' }}>
                    {displayText}
                </Text>
                {verified ? (
                    <BadgeCheck color='#22c55e' size={18} strokeWidth={2.2} />
                ) : null}
                {copyValue ? (
                    <TouchableOpacity onPress={handleCopy} hitSlop={10}>
                        {copied ? (
                            <Check color='#22c55e' size={18} strokeWidth={2.4} />
                        ) : (
                            <Copy color={theme.oppositeTextColor} size={18} strokeWidth={2.1} />
                        )}
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    )
}

function chunkText(value: string, every: number) {
    return value.replace(new RegExp(`(.{${every}})`, 'g'), '$1 ').trim()
}
