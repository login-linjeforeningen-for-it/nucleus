import AS from '@styles/adStyles'
import { Image, Platform, View, Text, Dimensions } from 'react-native'
import { SvgUri } from 'react-native-svg'
import React from 'react'
import { useSelector } from 'react-redux'
import capitalizeFirstLetter from '@utils/general/capitalizeFirstLetter'
import { resolveJobBanner, resolveOrganizationLogo } from './adAssets'

type AdClusterLocationProps = {
    ad: GetJobProps | undefined
}

/**
 * Function for drawing a small image on the left side of the ad cluster
 * @param {string} banner Link to the advertisement banner
 * @returns               Small banner image
 */
export function AdClusterImage({
    logoUrl,
    bannerUrl,
    compact
}: {
    logoUrl?: string | undefined
    bannerUrl?: string | undefined
    compact?: boolean
}) {
    const resolvedLogoUrl = resolveOrganizationLogo(logoUrl)
    const resolvedBannerUrl = resolveJobBanner(bannerUrl)
    const width = compact ? 74 : 90
    const height = compact ? 60 : 60
    const [candidateIndex, setCandidateIndex] = React.useState(0)
    const candidates = React.useMemo(
        () => [
            resolvedLogoUrl ? { uri: resolvedLogoUrl, kind: 'logo' as const } : null,
            resolvedBannerUrl ? { uri: resolvedBannerUrl, kind: 'banner' as const } : null
        ].filter(Boolean) as { uri: string, kind: 'logo' | 'banner' }[],
        [resolvedBannerUrl, resolvedLogoUrl]
    )
    const currentCandidate = candidates[candidateIndex]
    const resolvedUrl = currentCandidate?.uri || ''
    const isLogo = currentCandidate?.kind === 'logo'

    React.useEffect(() => {
        setCandidateIndex(0)
    }, [resolvedBannerUrl, resolvedLogoUrl])

    const imageWrapperStyle = {
        width,
        height,
        borderRadius: compact ? 12 : 14,
        backgroundColor: isLogo ? '#ffffff' : '#101010',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        overflow: 'hidden' as const,
    }

    // Handles svg icons
    if (resolvedUrl.endsWith('.svg')) {
        return (
            <View style={imageWrapperStyle}>
                <SvgUri
                    width={isLogo ? width - 12 : width}
                    height={isLogo ? height - 20 : height}
                    uri={resolvedUrl}
                    onError={() => setCandidateIndex((current) => current + 1)}
                />
            </View>
        )
    }

    if (resolvedUrl) {
        return (
            <View style={imageWrapperStyle}>
                <Image
                    style={{
                        width: isLogo ? width - 12 : width,
                        height: isLogo ? height - 18 : height,
                        resizeMode: isLogo ? 'contain' : 'cover',
                    }}
                    source={{ uri: resolvedUrl, cache: 'force-cache' }}
                    onError={() => setCandidateIndex((current) => current + 1)}
                />
            </View>
        )
    }

    // Only use the fallback icon when no logo or banner exists at all.
    return (
        <View style={AS.adClusterImage}>
            <View
                style={{
                    width,
                    height,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <View style={{
                    width: compact ? 38 : 72,
                    height: compact ? 38 : 48,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image
                        source={require('@assets/menu/business-orange.png')}
                        style={{
                            width: compact ? 22 : 30,
                            height: compact ? 22 : 30,
                            resizeMode: 'contain',
                            opacity: 0.85,
                        }}
                    />
                </View>
            </View>
        </View>
    )
}

/**
 * Visual representation of the location on the Ad Cluster
 *
 * @param {AdProps} ad  Ad object
 * @returns
 */
export function AdClusterLocation({ ad }: AdClusterLocationProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const type = capitalizeFirstLetter(lang ? ad?.job_type.name_no : ad?.job_type.name_en)
    const location = ad?.cities?.map(city => capitalizeFirstLetter(city)).join(', ')
    let name = lang ? ad?.title_no || ad?.title_en : ad?.title_en || ad?.title_no
    let info = `${type}${location ? `. ${location}` : ''}`
    const halfWidth = Platform.OS === 'ios'
        ? Dimensions.get('window').width / 9
        : Dimensions.get('window').width / 8.7805
    if (name == undefined) {
        name = ''
    } else if (name.length > halfWidth / 1.7
        && (type + location).length > (halfWidth * 1.25)) {
        name = name.length > halfWidth / 1.1
            ? name.substring(0, halfWidth / 1.1) + '...'
            : name
        info = info.substring(0, halfWidth / 1.3) + '...'
    } else if (name.length > halfWidth) {
        name = name.substring(0, halfWidth) + '...'
    } else if (info.length > (Platform.OS === 'ios'
        ? halfWidth * 1.45
        : halfWidth * 1.5)) {
        info = info.substring(0, Platform.OS === 'ios'
            ? halfWidth * 1.45
            : halfWidth * 1.5) + '...'
    }

    return (
        <View style={AS.locationView}>
            <View style={{ ...AS.title }}>
                <Text style={{ ...AS.title, color: theme.textColor }}>
                    {name}
                </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ ...AS.loc, color: theme.oppositeTextColor }}>
                    {info}
                </Text>
            </View>
        </View>
    )
}

export function getAdClusterMeta(ad: GetJobProps | undefined, lang: boolean) {
    const type = capitalizeFirstLetter(lang ? ad?.job_type?.name_no : ad?.job_type?.name_en)
    const location = ad?.cities?.map(city => capitalizeFirstLetter(city)).join(', ')
    const orgName = lang
        ? ad?.organization?.name_no || ad?.organization?.name_en
        : ad?.organization?.name_en || ad?.organization?.name_no

    return [type, location, orgName].filter(Boolean).join(' · ')
}
