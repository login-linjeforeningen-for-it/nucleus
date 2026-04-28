import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { JSX } from 'react'
import { View } from 'react-native'

type SummaryListItem = {
    title: string
    body: string
}

export default function SummaryListCard({ title, items, theme }: { title: string, items: SummaryListItem[], theme: Theme }): JSX.Element | null {
    if (!items.length) {
        return null
    }

    return (
        <>
            <Space height={16} />
            <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                <Space height={10} />
                {items.map((item, index) => (
                    <View
                        key={`${item.title}-${index}`}
                        style={{
                            paddingVertical: 8,
                            borderBottomWidth: index === items.length - 1 ? 0 : 1,
                            borderBottomColor: theme.darker,
                        }}
                    >
                        <Text style={{ ...T.text15, color: theme.textColor }}>
                            {item.title}
                        </Text>
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            {item.body}
                        </Text>
                    </View>
                ))}
            </View>
        </>
    )
}
