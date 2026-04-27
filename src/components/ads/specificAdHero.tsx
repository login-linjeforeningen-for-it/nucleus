import Cluster from '@components/shared/cluster'
import T from '@styles/text'
import { Dimensions, Image, Text, View } from 'react-native'
import { SvgUri } from 'react-native-svg'
import { useSelector } from 'react-redux'
import { resolveAssetUrl } from './specificAdUtils'

const logoBoxStyle = {
    ...mediaBoxStyle(14, 0),
    width: 74,
    height: 64,
}

export default function SpecificAdHero({ ad }: { ad: GetJobProps }) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const title = lang ? ad.title_no || ad.title_en : ad.title_en || ad.title_no
    const orgName = lang
        ? ad.organization?.name_no || ad.organization?.name_en
        : ad.organization?.name_en || ad.organization?.name_no
    const bannerUrl = resolveAssetUrl(ad.banner_image, 'jobs')
    const logoUrl = resolveAssetUrl(ad.organization?.logo, 'organizations')
    const width = Dimensions.get('window').width - 24

    return (
        <Cluster>
            <View style={{ padding: 14 }}>
                <BannerMedia bannerUrl={bannerUrl} width={width} />
                {orgName ? (
                    <Text style={{ ...T.text18, color: theme.orange, marginBottom: 10 }}>
                        {orgName}
                    </Text>
                ) : null}
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <LogoMedia logoUrl={logoUrl} />
                    <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
                        <Text style={{ ...T.text18, color: theme.textColor, lineHeight: 22 }}>
                            {title}
                        </Text>
                    </View>
                </View>
            </View>
        </Cluster>
    )
}

function BannerMedia({ bannerUrl, width }: { bannerUrl: string, width: number }) {
    if (!bannerUrl) {
        return null
    }

    if (bannerUrl.endsWith('.svg')) {
        return (
            <View style={mediaBoxStyle(20, 14, true)}>
                <SvgUri width={width - 28} height={(width - 28) / 2.4} uri={bannerUrl} />
            </View>
        )
    }

    return (
        <Image
            source={{ uri: bannerUrl, cache: 'force-cache' }}
            style={{ width: '100%', aspectRatio: 2.2, borderRadius: 20, backgroundColor: '#101010', marginBottom: 14 }}
            resizeMode='cover'
        />
    )
}

function LogoMedia({ logoUrl }: { logoUrl: string }) {
    if (!logoUrl) {
        return null
    }

    if (logoUrl.endsWith('.svg')) {
        return (
            <View style={logoBoxStyle}>
                <SvgUri width={58} height={34} uri={logoUrl} />
            </View>
        )
    }

    return (
        <View style={logoBoxStyle}>
            <Image source={{ uri: logoUrl, cache: 'force-cache' }} style={{ width: 66, height: 56 }} resizeMode='contain' />
        </View>
    )
}

function mediaBoxStyle(borderRadius: number, marginBottom: number, padded = false) {
    return {
        borderRadius,
        backgroundColor: '#fff',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        overflow: 'hidden' as const,
        paddingVertical: padded ? 12 : 0,
        marginBottom,
    }
}
