import Swipe from '@components/nav/swipe'
import Space from '@components/shared/utils'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { JSX, ReactNode } from 'react'
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native'

type Props = {
    backgroundColor: string
    textColor: string
    mutedTextColor: string
    title: string
    body: string
    actionLabel?: string
    actionColor?: string
    actionTextColor?: string
    onPress?: () => void
    children?: ReactNode
}

export default function QueenbeeGate({
    backgroundColor,
    textColor,
    mutedTextColor,
    title,
    body,
    actionLabel,
    actionColor,
    actionTextColor,
    onPress,
    children
}: Props): JSX.Element {
    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor }}>
                <ScrollView style={GS.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Space height={Dimensions.get('window').height / 8} />
                    <Text style={{ ...T.centeredBold20, color: textColor }}>{title}</Text>
                    <Space height={14} />
                    <Text style={{ ...T.centered15, color: mutedTextColor }}>
                        {body}
                    </Text>
                    {actionLabel && onPress && actionColor && actionTextColor
                        ? (
                            <>
                                <Space height={20} />
                                <TouchableOpacity onPress={onPress}>
                                    <View style={{ borderRadius: 18, backgroundColor: actionColor, padding: 14 }}>
                                        <Text style={{ ...T.centered20, color: actionTextColor }}>{actionLabel}</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )
                        : null}
                    {children}
                </ScrollView>
            </View>
        </Swipe>
    )
}
