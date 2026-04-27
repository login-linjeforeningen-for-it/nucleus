import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { JSX } from 'react'
import { Dimensions, Linking, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

type PolicySection = {
    title: string
    body: string
}

export default function PolicyScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').policy : require('@text/en.json').policy

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
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.organization}</Text>
                        </View>
                    </Cluster>

                    <Space height={10} />
                    {(text.sections as PolicySection[]).map((section) => (
                        <PolicyCard key={section.title} section={section} />
                    ))}

                    <Space height={10} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {text.download}
                            </Text>
                            <Space height={12} />
                            <TouchableOpacity
                                onPress={() => void Linking.openURL(config.mailto_url)}
                                activeOpacity={0.88}
                            >
                                <View style={{
                                    borderRadius: 999,
                                    backgroundColor: theme.orange,
                                    paddingHorizontal: 16,
                                    paddingVertical: 11,
                                    alignSelf: 'flex-start',
                                }}>
                                    <Text style={{ ...T.text15, color: theme.textColor, fontWeight: '600' }}>
                                        kontakt@login.no
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

function PolicyCard({ section }: { section: PolicySection }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{section.title}</Text>
                    <Space height={6} />
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{section.body}</Text>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}
