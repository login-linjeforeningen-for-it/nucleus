import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import Clipboard from '@react-native-clipboard/clipboard'
import { JSX, useMemo } from 'react'
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

const topics = ['TEKKOM', 'SOCIAL', 'CTF', 'KARRIEREDAG', 'FADDERUKA', 'BEDPRES', 'LOGIN', 'ANNET']
const intervals = ['10m', '30m', '1h', '2h', '3h', '6h', '1d', '2d', '1w']

const examples = [
    {
        text: 'Varsling med tittel "Overskrift" og innhold "Innholdet i varslingen" til TekKom pa norsk:',
        command: '/notify title:Overskrift description:Innholdet i varslingen topic:nTEKKOM',
    },
    {
        text: 'Notification with title "Title" and content "Notification content" to TekKom in English:',
        command: '/notify title:Title description:Notification content topic:eTEKKOM',
    },
    {
        text: 'Notification to social in English:',
        command: '/notify title:Title of event to go to social topic description:Notification content topic:eSOCIAL',
    },
    {
        text: 'Event notification that opens event 19:',
        command: '/notify title:Overskrift description:Innholdet i varslingen topic:n19 screen:19',
    },
    {
        text: 'Job ad notification for job ad 2:',
        command: '/notify title:Overskrift description:Innholdet i varslingen topic:ea2',
    },
    {
        text: 'Category notification only for users who want alerts less than 10 minutes before start:',
        command: '/notify title:Overskrift description:Innholdet i varslingen topic:ntekkom10m',
    },
    {
        text: 'Event where users only want alerts 3-7 days before the event starts:',
        command: '/notify title:Overskrift description:Innholdet i varslingen topic:n191w screen:19',
    },
]

export default function NucleusDocumentationScreen({ navigation }: MenuProps<'NucleusDocumentationScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const labels = useMemo(() => ({
        title: lang ? 'Varslingsdokumentasjon' : 'Notification documentation',
        intro: lang
            ? 'Varslinger er kraftige og skal brukes med samme varsomhet som @everyone i Discord.'
            : 'Push notifications are powerful and should be used with the same care as @everyone in Discord.',
        topics: lang ? 'Topics' : 'Topics',
        intervals: lang ? 'Intervaller' : 'Intervals',
        prefixes: lang ? 'Prefixer' : 'Prefixes',
        prefixesBody: lang
            ? 'Bruk n for norsk og e for engelsk. Bruk a etter sprakprefix for jobbannonser.'
            : 'Use n for Norwegian and e for English. Use a after the language prefix for job ads.',
        examples: lang ? 'Eksempler' : 'Examples',
        copiedTitle: lang ? 'Kopiert' : 'Copied',
        copiedBody: lang ? 'Kommandoen ble kopiert.' : 'The command was copied.',
    }), [lang])

    function copyCommand(command: string) {
        Clipboard.setString(command)
        Alert.alert(labels.copiedTitle, labels.copiedBody)
    }

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='NucleusDocumentationScreen' navigation={navigation} />
                <ScrollView
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 14 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{labels.title}</Text>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.intro}</Text>
                        </View>
                    </Cluster>

                    <Space height={12} />
                    <InfoSection title={labels.topics} values={topics} />
                    <InfoSection title={labels.intervals} values={intervals} />

                    <Space height={12} />
                    <Cluster>
                        <View style={{ padding: 14 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>{labels.prefixes}</Text>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.prefixesBody}</Text>
                        </View>
                    </Cluster>

                    <Space height={12} />
                    <Text style={{ ...T.text20, color: theme.textColor, marginLeft: 6 }}>
                        {labels.examples}
                    </Text>
                    <Space height={8} />
                    {examples.map((example) => (
                        <TouchableOpacity
                            key={example.command}
                            onPress={() => copyCommand(example.command)}
                            activeOpacity={0.88}
                        >
                            <Cluster>
                                <View style={{ padding: 14 }}>
                                    <Text style={{ ...T.text15, color: theme.textColor }}>{example.text}</Text>
                                    <Space height={8} />
                                    <View style={{
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: '#ffffff12',
                                        backgroundColor: '#00000028',
                                        padding: 10,
                                    }}>
                                        <Text style={{ ...T.text12, color: theme.orange }}>
                                            {example.command}
                                        </Text>
                                    </View>
                                </View>
                            </Cluster>
                            <Space height={10} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function InfoSection({ title, values }: { title: string; values: string[] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {values.map((value) => (
                            <View
                                key={value}
                                style={{
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: theme.orangeTransparentBorder,
                                    backgroundColor: theme.orangeTransparent,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                }}
                            >
                                <Text style={{ ...T.text12, color: theme.textColor }}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Cluster>
            <Space height={12} />
        </>
    )
}
