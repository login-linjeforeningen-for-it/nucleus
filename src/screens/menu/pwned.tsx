import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, Image, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

type PwnedMeme = {
    text: string
    image: string
}

export default function PwnedScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').pwned : require('@text/en.json').pwned
    const memes = Array.isArray(text.pwned) ? text.pwned as PwnedMeme[] : []
    const [secondsElapsed, setSecondsElapsed] = useState(1)
    const [memeIndex, setMemeIndex] = useState(() => memes.length ? Math.floor(Math.random() * memes.length) : 0)
    const meme = memes[memeIndex] || memes[0] || null
    const secondsLabel = secondsElapsed === 1 ? text.second : text.seconds

    useEffect(() => {
        const startedAt = Date.now()
        const interval = setInterval(() => {
            setSecondsElapsed(Math.max(1, Math.floor((Date.now() - startedAt) / 1000)))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    function shuffleMeme() {
        if (!memes.length) return
        setMemeIndex((current) => (current + 1) % memes.length)
    }

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{text.title}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.intro}</Text>
                        </View>
                    </Cluster>

                    <Space height={10} />
                    <Cluster>
                        <View style={{ padding: 12, alignItems: 'center' }}>
                            {meme ? (
                                <>
                                    <Text style={{ ...T.text20, color: theme.textColor, textAlign: 'center' }}>
                                        {meme.text}
                                    </Text>
                                    <Space height={14} />
                                    <Image
                                        source={{ uri: `${config.cdn}/img/pwned/${meme.image}`, cache: 'force-cache' }}
                                        resizeMode='contain'
                                        style={{
                                            width: '100%',
                                            height: 330,
                                            borderRadius: 22
                                        }}
                                    />
                                </>
                            ) : (
                                <Text style={{ ...T.text20, color: theme.textColor, textAlign: 'center' }}>
                                    {text.title}
                                </Text>
                            )}
                            <Space height={14} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor, textAlign: 'center' }}>
                                {text.text.replace('{time}', `${secondsElapsed} ${secondsLabel}`)}
                            </Text>
                            <Space height={20} />
                            <TouchableOpacity onPress={shuffleMeme} activeOpacity={0.88}>
                                <View style={{
                                    borderRadius: 999,
                                    backgroundColor: theme.orange,
                                    paddingHorizontal: 16,
                                    paddingVertical: 11,
                                }}>
                                    <Text style={{ ...T.text15, color: theme.textColor, fontWeight: '600' }}>
                                        {text.shuffle}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Cluster>
                </ScrollView>
            </View>
        </Swipe>
    )
}
