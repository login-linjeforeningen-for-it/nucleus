import config from '@/constants'
import GS from '@styles/globalStyles'
import { Image, ImageSourcePropType, Linking, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

type MediaLogoProps = {
    link: string
    logo: ImageSourcePropType
}

type MediaProps = {
    [key: string]: {
        link: string
        logo: ImageSourcePropType
    }
}

/**
 * Function for displaying all of the social media you can reaxch Login on
 * @returns Social media icons
 */
export function Social() {
    const { isDark } = useSelector((state: ReduxState) => state.theme)

    const media: MediaProps = {
        discord: {
            link: config.discord,
            logo: isDark
                ? require('@assets/social/discord-white.png')
                : require('@assets/social/discord-black.png')
        },
        instagram: {
            link: config.instagram,
            logo: isDark
                ? require('@assets/social/instagram-white.png')
                : require('@assets/social/instagram-black.png')
        },
        facebook: {
            link: config.facebook,
            logo: isDark
                ? require('@assets/social/facebook-white.png')
                : require('@assets/social/facebook-black.png')
        },
        linkedin: {
            link: config.linkedin,
            logo: isDark
                ? require('@assets/social/linkedin-white.png')
                : require('@assets/social/linkedin-black.png')
        },
        gitlab: {
            link: config.github,
            logo: isDark
                ? require('@assets/social/github-white.png')
                : require('@assets/social/github-black.png')
        },
        wiki: {
            link: config.wiki,
            logo: isDark
                ? require('@assets/social/wiki-white.png')
                : require('@assets/social/wiki-black.png')
        }
    }

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 10
        }}>
            {Object.values(media).map((item, index) => (
                <MediaLogo
                    key={item.link}
                    link={item.link}
                    logo={media[Object.keys(media)[index]].logo}
                />
            ))}
        </View>
    )
}

function MediaLogo({ link, logo }: MediaLogoProps) {
    return (
        <View style={GS.socialPartView}>
            <TouchableOpacity onPress={() => Linking.openURL(link)}>
                <Image style={GS.medium} source={logo} />
            </TouchableOpacity>
        </View>
    )
}
