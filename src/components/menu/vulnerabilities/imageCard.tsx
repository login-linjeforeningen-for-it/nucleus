import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { TouchableOpacity, View } from 'react-native'
import {
    formatDateTime,
    SCANNER_ORDER,
    SEVERITY_ORDER,
    scannerBorder,
    scannerColor,
    scannerTextColor,
    scannerTitle,
    severityBorder,
    severityColor,
    severityTitle,
} from '@utils/vulnerabilities'
import { glassCard, MetaStat, SeverityBadge } from './primitives'
import VulnList from './vulnerabilityDetails'
import ImageSources from './imageSources'

type VulnerabilityImage = GetVulnerabilities['images'][number]

type Props = {
    image: VulnerabilityImage
    isExpanded: boolean
    expandedVulnerabilities: Record<string, boolean>
    onToggleImage: (image: string) => void
    onToggleVulnerability: (key: string) => void
    theme: Theme
}

export default function ImageCard({
    image,
    isExpanded,
    expandedVulnerabilities,
    onToggleImage,
    onToggleVulnerability,
    theme
}: Props) {
    return (
        <View>
            <Cluster>
                <View style={glassCard(theme.greyTransparent, theme.greyTransparentBorder, 14)}>
                    <ImageHeader image={image} isExpanded={isExpanded} onToggle={() => onToggleImage(image.image)} theme={theme} />
                    {isExpanded ? (
                        <>
                            <ImageStats image={image} theme={theme} />
                            <ImageSources image={image} theme={theme} />
                            <VulnList
                                image={image}
                                expandedVulnerabilities={expandedVulnerabilities}
                                onToggle={onToggleVulnerability}
                                theme={theme}
                            />
                        </>
                    ) : null}
                </View>
            </Cluster>
            <Space height={10} />
        </View>
    )
}

function ImageHeader({ image, isExpanded, onToggle, theme }: {
    image: VulnerabilityImage
    isExpanded: boolean
    onToggle: () => void
    theme: Theme
}) {
    return (
        <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
            <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...T.text15, color: theme.textColor }}>{image.image}</Text>
                        <Space height={4} />
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            {`Scanned ${formatDateTime(image.scannedAt)}`}
                        </Text>
                    </View>
                    <SeverityBadge
                        label={isExpanded ? 'Hide details' : 'Show details'}
                        color={theme.orangeTransparent}
                        borderColor={theme.orangeTransparentBorder}
                        textColor={theme.textColor}
                    />
                </View>
                <ScannerCoverage image={image} theme={theme} />
                <SeverityBreakdown image={image} theme={theme} />
                {!!image.scanError && (
                    <View style={glassCard('rgba(255, 107, 107, 0.12)', 'rgba(255, 107, 107, 0.24)', 10)}>
                        <Text style={{ ...T.text12, color: '#ffb0b0' }}>{image.scanError}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

function ScannerCoverage({ image, theme }: { image: VulnerabilityImage, theme: Theme }) {
    const results = (image.scannerResults || []).slice().sort((left, right) => (
        SCANNER_ORDER.indexOf(left.scanner) - SCANNER_ORDER.indexOf(right.scanner)
    ))

    if (!results.length) {
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <SeverityBadge
                    label='No scanner metadata'
                    color='rgba(255,255,255,0.04)'
                    borderColor='rgba(255,255,255,0.08)'
                    textColor={theme.oppositeTextColor}
                />
            </View>
        )
    }

    return (
        <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {results.map(result => (
                    <SeverityBadge
                        key={`${image.image}-${result.scanner}`}
                        label={`${scannerTitle(result.scanner)} ${result.totalVulnerabilities}`}
                        color={scannerColor(result.scanner)}
                        borderColor={scannerBorder(result.scanner)}
                        textColor={scannerTextColor(result.scanner)}
                    />
                ))}
            </View>
            {results.some(result => result.note || result.scanError) ? (
                <View style={{ gap: 6 }}>
                    {results.filter(result => result.note || result.scanError).map(result => (
                        <Text
                            key={`${image.image}-${result.scanner}-note`}
                            style={{ ...T.text12, color: result.scanError ? '#ffb0b0' : theme.oppositeTextColor }}
                        >
                            {`${scannerTitle(result.scanner)}: ${result.scanError || result.note}`}
                        </Text>
                    ))}
                </View>
            ) : null}
        </View>
    )
}

function SeverityBreakdown({ image, theme }: { image: VulnerabilityImage, theme: Theme }) {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SEVERITY_ORDER.map(level => (
                <SeverityBadge
                    key={`${image.image}-${level}`}
                    label={`${severityTitle(level)} ${image.severity[level] || 0}`}
                    color={severityColor(level)}
                    borderColor={severityBorder(level)}
                    textColor={theme.textColor}
                />
            ))}
        </View>
    )
}

function ImageStats({ image, theme }: { image: VulnerabilityImage, theme: Theme }) {
    return (
        <>
            <Space height={12} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <MetaStat label='Total findings' value={String(image.totalVulnerabilities)} theme={theme} />
                <MetaStat label='Groups' value={String(image.groups.length)} theme={theme} />
                <MetaStat label='Details' value={String(image.vulnerabilities.length)} theme={theme} />
            </View>
        </>
    )
}
