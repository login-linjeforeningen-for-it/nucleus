import Space, { Line } from '@/components/shared/utils'
import Dropdown from '@/components/about/dropdown'
import Cluster from '@/components/shared/cluster'
import GS from '@styles/globalStyles'
import { useSelector } from 'react-redux'
import en from '@text/menu/about/en.json'
import no from '@text/menu/about/no.json'
import { JSX, useState } from 'react'
import T from '@styles/text'
import { Copyright, Social, Styret } from '@/components/about/social'
import { CommitteeContent, CommitteePerson, CommitteeView } from '@/components/about/committee/committeeSection'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Swipe from '@components/nav/swipe'
import { TextLink } from '@components/shared/link'
import config from '@/constants'

export default function AboutScreen(): JSX.Element {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [committee, setCommittee] = useState(0)
    const text = lang ? no : en
    const info = text.committeeSection.info

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker, paddingTop: 100 }}>
                <ScrollView style={GS.content} showsVerticalScrollIndicator={false}>
                    <Cluster>
                        <Text style={{ ...T.bold40, color: theme.textColor }}>
                            {text.title}
                        </Text>
                        <Space height={5} />
                        <Line width={5}>
                            <Text style={{
                                ...T.boldWithLine,
                                color: theme.textColor
                            }}>
                                {text.intro}
                            </Text>
                        </Line>
                        <Space height={12} />
                        <Dropdown />
                        <Space height={14} />
                        <Styret />
                        <Text style={{
                            ...T.bold25,
                            marginTop: 18,
                            marginBottom: 12,
                            color: theme.textColor
                        }}>
                            {text.about.title}
                        </Text>
                        <Line width={5}>
                            <Text style={{
                                ...T.boldWithLine,
                                color: theme.textColor
                            }}>
                                {text.about.intro}
                            </Text>
                        </Line>
                        <Text style={{
                            ...T.paragraph,
                            marginTop: 10,
                            lineHeight: 22,
                            color: theme.textColor
                        }}>
                            {text.about.body.p1}
                        </Text>
                        <Text style={{
                            ...T.paragraph,
                            marginTop: 10,
                            lineHeight: 22,
                            color: theme.textColor
                        }}>
                            {text.about.body.p2}
                        </Text>
                        <Text style={{
                            ...T.bold25,
                            marginTop: 20,
                            color: theme.textColor
                        }}>
                            {text.committeeSection.title}
                        </Text>
                        <Text style={{
                            ...T.boldParagraph,
                            marginTop: 8,
                            marginBottom: 14,
                            color: theme.textColor
                        }}>
                            {text.committeeSection.intro}
                        </Text>
                        <CommitteeView
                            setCommittee={setCommittee}
                            committee={committee}
                        />
                        <Space height={12} />
                        {
                            info.map((relevantCommittee, index) => {
                                if (relevantCommittee.id === committee) {
                                    return <CommitteeContent
                                        key={index}
                                        index={index}
                                        relevantCommittee={relevantCommittee}
                                    />
                                }
                                return null
                            })
                        }

                        <Space height={8} />
                        <CommitteePerson committee={committee} />
                        <Text style={{
                            ...T.text25,
                            marginTop: 6,
                            marginBottom: 8,
                            color: theme.textColor
                        }}>
                            {text.publicDocs.title}
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Text style={{
                                ...T.paragraph,
                                color: theme.textColor
                            }}>
                                {text.publicDocs.body}
                            </Text>
                            <TextLink
                                url={config.wiki_url}
                                text={text.publicDocs.wiki}
                            />
                            <Text style={{ ...T.paragraph, color: theme.textColor }}>.</Text>
                        </View>
                        <Social />
                        <Space height={8} />
                        <Copyright />
                    </Cluster>
                    <Space height={100} />
                </ScrollView>
            </View>
        </Swipe>
    )
}
