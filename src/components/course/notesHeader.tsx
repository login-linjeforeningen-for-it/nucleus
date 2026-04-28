import { View } from 'react-native'
import Space from '@components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { MetaPill } from './notesControls'

type NotesHeaderProps = {
    title: string
    subtitle: string
    stats: string
    wordCount: string
    lang: boolean
    theme: Theme
}

export default function NotesHeader({ title, subtitle, stats, wordCount, lang, theme }: NotesHeaderProps) {
    return (
        <View style={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: '#ffffff10',
            backgroundColor: '#ffffff05',
        }}>
            <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
            <Space height={4} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{subtitle}</Text>
            <Space height={12} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <MetaPill label={lang ? 'Status' : 'Status'} value={stats} theme={theme} />
                <MetaPill label={lang ? 'Ord' : 'Words'} value={wordCount} theme={theme} />
                <MetaPill label='Markdown' value={lang ? 'Støttet' : 'Enabled'} theme={theme} />
            </View>
        </View>
    )
}
