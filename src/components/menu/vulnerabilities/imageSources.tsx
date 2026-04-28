import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { View } from 'react-native'
import {
    SEVERITY_ORDER,
    severityBorder,
    severityColor,
    severityTitle,
} from '@utils/vulnerabilities'
import { glassCard, SeverityBadge } from './primitives'

type VulnerabilityImage = GetVulnerabilities['images'][number]
const INITIAL_SOURCE_LIMIT = 8

export default function ImageSources({ image, theme }: { image: VulnerabilityImage, theme: Theme }) {
    const visibleGroups = image.groups.slice(0, INITIAL_SOURCE_LIMIT)
    const hiddenCount = image.groups.length - visibleGroups.length

    return (
        <>
            <Space height={12} />
            <View style={{ gap: 10 }}>
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Sources</Text>
                {visibleGroups.length ? visibleGroups.map(group => (
                    <View key={`${image.image}-${group.source}`} style={glassCard('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 12)}>
                        <View style={{ gap: 10 }}>
                            <View>
                                <Text style={{ ...T.text15, color: theme.textColor }}>{group.source}</Text>
                                <Space height={2} />
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{`${group.total} findings`}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {SEVERITY_ORDER.filter(level => group.severity[level] > 0).map(level => (
                                    <SeverityBadge
                                        key={`${image.image}-${group.source}-${level}`}
                                        label={`${severityTitle(level)} ${group.severity[level]}`}
                                        color={severityColor(level)}
                                        borderColor={severityBorder(level)}
                                        textColor={theme.textColor}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                )) : <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>No grouped findings available yet.</Text>}
                {hiddenCount > 0 ? <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{`+ ${hiddenCount} more sources hidden for faster loading`}</Text> : null}
            </View>
        </>
    )
}
