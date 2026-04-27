import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Animated, TextInput, TouchableOpacity, View } from 'react-native'

export type SearchEngine = 'brave' | 'google' | 'duckduckgo'

type SearchText = {
    placeholder: string
    typingFallback: string
    opening: string
    openAnimation: string
    tapToCopy: string
}

type SearchInputCardProps = {
    query: string
    engine: SearchEngine
    link: string
    text: SearchText
    theme: Theme
    pulse: Animated.Value
    stage: 'idle' | 'typing' | 'opening'
    typedQuery: string
    onQuery: (query: string) => void
    onEngine: (engine: SearchEngine) => void
    onOpen: () => void
    onCopy: () => void
}

export function SearchInputCard({
    query,
    engine,
    link,
    text,
    theme,
    pulse,
    stage,
    typedQuery,
    onQuery,
    onEngine,
    onOpen,
    onCopy,
}: SearchInputCardProps) {
    return (
        <Cluster>
            <View style={{ padding: 12, gap: 12 }}>
                <TextInput
                    value={query}
                    onChangeText={onQuery}
                    placeholder={text.placeholder}
                    placeholderTextColor={theme.oppositeTextColor}
                    style={inputStyle(theme)}
                />
                <EngineSelector engine={engine} theme={theme} onEngine={onEngine} />
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                    <Cluster style={{ borderWidth: 1, borderColor: theme.orangeTransparentBorder, backgroundColor: theme.orangeTransparent }}>
                        <TouchableOpacity onPress={onOpen}>
                            <View style={{ padding: 14 }}>
                                <Text style={{ ...T.centered20, color: theme.textColor }}>
                                    {stage === 'typing' ? typedQuery || text.typingFallback : stage === 'opening' ? text.opening : text.openAnimation}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Cluster>
                </Animated.View>
                {!!link && <SearchLinkCard link={link} text={text} theme={theme} onCopy={onCopy} />}
            </View>
        </Cluster>
    )
}

function EngineSelector({
    engine,
    theme,
    onEngine,
}: {
    engine: SearchEngine
    theme: Theme
    onEngine: (engine: SearchEngine) => void
}) {
    return (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(['brave', 'google', 'duckduckgo'] as SearchEngine[]).map((value) => (
                <TouchableOpacity key={value} onPress={() => onEngine(value)}>
                    <Cluster style={{
                        backgroundColor: value === engine ? theme.orangeTransparentHighlighted : theme.orangeTransparent,
                        borderWidth: 1,
                        borderColor: value === engine ? theme.orangeTransparentBorderHighlighted : theme.orangeTransparentBorder,
                    }}>
                        <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                            <Text style={{ ...T.text15, color: theme.textColor }}>{formatEngineLabel(value)}</Text>
                        </View>
                    </Cluster>
                </TouchableOpacity>
            ))}
        </View>
    )
}

function SearchLinkCard({
    link,
    text,
    theme,
    onCopy,
}: {
    link: string
    text: SearchText
    theme: Theme
    onCopy: () => void
}) {
    return (
        <TouchableOpacity onPress={onCopy}>
            <Cluster style={{ borderWidth: 1, borderColor: '#ffffff12', backgroundColor: '#ffffff08' }}>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{text.tapToCopy}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text15, color: theme.textColor }}>{link}</Text>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}

function formatEngineLabel(value: SearchEngine) {
    switch (value) {
        case 'duckduckgo': return 'Duck Duck Go'
        case 'google': return 'Google'
        default: return 'Brave'
    }
}

function inputStyle(theme: Theme) {
    return {
        color: theme.textColor,
        borderWidth: 1,
        borderColor: '#ffffff18',
        borderRadius: 16,
        backgroundColor: '#ffffff08',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    }
}
