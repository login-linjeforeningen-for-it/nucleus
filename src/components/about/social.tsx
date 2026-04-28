import DefaultBanner from '@components/event/defaultBanner'
import ES from '@styles/eventStyles'
import GS from '@styles/globalStyles'
import Link, { TextLink } from '@components/shared/link'
import T from '@styles/text'
import { JSX } from 'react'
import { useSelector } from 'react-redux'
import { random } from '@/components/shared/utils'
import personInfo from '@utils/people/personInfo'
import {
    Image,
    ImageSourcePropType,
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import config from '@/constants'

type PersonProps = {
    person: string
}

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

type StaticImageProps = {
    category: string | null
}

type CornerSquareProps = {
    corner: number
    type?: boolean
}

/**
 * **Person object**
 *
 * Includes:
 * - Title
 * - Name
 * - Discord tag
 * - Discord link
 * - CDN image link
 *
 * @param {string} person
 * @returns Full object packed in a view component
 */
export default function Person({ person }: PersonProps): JSX.Element {

    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const obj = personInfo({ person, lang })
    const corner = random({ min: 0, max: 4 })

    return (
        <View style={{ marginBottom: 20 }}>
            <Image style={{ ...GS.personImage }} source={{ uri: obj.img, cache: 'force-cache' }} />
            <CornerSquare corner={corner} />
            <View style={{ width: '72%', alignSelf: 'center' }}>
                <Text style={{ ...T.leaderTitle, left: 0 }}>{obj.title}</Text>
                <Text style={{ ...T.leaderName, left: 0, color: theme.textColor }}>
                    {obj.name}
                </Text>
                <Link url={obj.dclink}>
                    <Text style={{ ...T.discord, left: 0, color: theme.discord }}>
                        <Image
                            style={GS.tiny}
                            source={require('@assets/social/discord-colored.png')}
                        />
                        {obj.tag}
                    </Text>
                </Link>
            </View>
        </View>
    )
}

function CornerSquare({ corner, type }: CornerSquareProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const horizontal = corner === 0 || corner === 2
    const left = corner === 3 ? '20.6%' : corner === 1 ? '0.4%' : undefined
    const top = corner === 3 ? '-49.4%' : undefined

    return (
        <View style={{ height: '100%', width: '100%', position: 'absolute', alignSelf: 'center' }}>
            <View style={type
                ? {
                    left, top,
                    transform: [{ rotate: `${90 * corner}deg` }],
                    width: horizontal ? '100%' : undefined,
                    height: horizontal ? undefined : '180%',
                    aspectRatio: horizontal ? 1.5 : 0.66,
                    right: horizontal ? undefined : Platform.OS === 'ios' ? '45%' : '40%',
                    bottom: horizontal ? undefined : '30.3%',
                }
                : { ...GS.personImage, transform: [{ rotate: `${90 * corner}deg` }] }
            }>
                <View style={{ width: 83, height: 13, backgroundColor: theme.orange }} />
                <View style={{ width: 13, height: 70, backgroundColor: theme.orange }} />
                <View style={{ width: 13, height: 70, left: 13, top: -70, backgroundColor: theme.darker }} />
                <View style={{ width: 70, height: 13, left: 13, top: -140, backgroundColor: theme.darker }} />
                <View style={{ width: 26, height: 13, top: -83, backgroundColor: theme.darker }} />
                <View style={{ width: 13, height: 26, left: 83, top: -179, backgroundColor: theme.darker }} />
            </View>
        </View>
    )
}

/**
 * Function for displaying all committees
 * @returns View containing all committees
 */
export function AllComitees(): JSX.Element {
    return (
        <View>
            <Person person='leader' />
            <Person person='coleader' />
            <Person person='secretary' />
            <Person person='evntkom' />
            <Person person='pr' />
            <Person person='tekkom' />
            <Person person='ctf' />
            <Person person='eco' />
            <Person person='bedkom' />
            <Person person='barkom' />
        </View>
    )
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

/**
 * **Person object**
 *
 * Includes:
 * - Title
 * - Name
 * - Discord tag
 * - Discord link
 * - CDN image link
 *
 * @param person
 * @returns Full object packed in a view component
 */
export function Styret() {
    const corner = random({ min: 0, max: 4 })

    return (
        <View>
            <Image
                style={{ ...GS.aboutImage }}
                source={{ uri: `${config.cdn}/img/board/group/styret_2026.jpg`, cache: 'force-cache' }}
            />
            <CornerSquare corner={corner} type={true} />
        </View>
    )
}

/**
 * Function for displaying the contact info of Login - Linjeforeningen for IT as a text inside a view
 * @returns Contact info
 */
export function Contact() {

    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const color = theme.textColor

    const info = {
        contact: lang ? 'Kontakt' : 'Contact',
        name: 'Login - Linjeforeningen for IT',
        address: 'Teknologivegen 22',
        location: lang ? 'Bygg A, rom 155' : 'Building A, room 155',
        post: '2815 GJØVIK'
    }

    return (
        <View>
            <Text style={{ ...T.centeredBold20, color }}>{info.contact}</Text>
            <Text style={{ ...T.centered15, color }}>{info.name}</Text>
            <Text style={{ ...T.centered15, color }}>{info.location}</Text>
            <Text style={{ ...T.centered15, color }}>{info.address}</Text>
            <Text style={{ ...T.centered15, color }}>{info.post}</Text>

            <TextLink
                url={config.mailto}
                text={config.mail}
                style={{ ...T.orange15, top: 3.2, alignSelf: 'center', marginBottom: 20 }}
            />
        </View>
    )
}

/**
 * Function for displaying the copyright info of Login - Linjeforeningen for IT as a text inside a view
 * @returns Copyright view
 */
export function Copyright() {

    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <Text style={{ ...T.copyright, color: theme.oppositeTextColor }}>
                {`${lang ? 'Opphavsrett' : 'Copyright'} © 2022-${new Date().getFullYear()} Login`
                    + ' - Linjeforeningen for IT\nD-U-N-S 345 129 409\nNO 811 940 372'}
            </Text>
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

export function StaticImage({ category }: StaticImageProps): JSX.Element {
    return (
        <DefaultBanner
            category={category}
            height={ES.specificEventImage.height as number}
            borderRadius={18}
        />
    )
}
