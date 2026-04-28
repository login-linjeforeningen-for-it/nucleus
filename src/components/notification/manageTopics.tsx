import { useRef, useState } from 'react'
import { Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import TopicManager from '@utils/notification/topicManager'
import Text from '@components/shared/text'
import T from '@styles/text'

const TOPIC_MANAGER_STYLES = StyleSheet.create({
    inputText: {
        minWidth: '80%',
        height: 35,
        borderRadius: 20,
        top: 25,
        ...T.text15,
        marginBottom: 25
    },
    dropImage: {
        alignSelf: 'center',
        height: 80,
        width: 40,
        top: -20,
        left: 0.8
    },
    touch: {
        height: 40,
        width: 40,
        right: Dimensions.get('window').width / 8,
        top: 35,
        borderRadius: 10
    },
    feedback: {
        alignSelf: 'center',
        top: 20,
    }
})

enum Topic {
    Subscribe = 1,
    Unsubscribe = 0
}

export default function ManageTopics() {
    // Sub / unsub mode, true for sub, false for unsub
    const [mode, setMode] = useState(Topic.Subscribe)
    const [result, setResult] = useState<TopicManagerResult>({ result: false, feedback: 'undefined' })
    const [display, setDisplay] = useState(false)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [text, setText] = useState('')
    const copyText = mode
        ? 'Subscribe mode (click here for unsubscribe mode)'
        : 'Unsubscribe mode (click here for subscribe mode)'
    const textInputRef = useRef<TextInput | null>(null)

    function handleText(val: string) {
        setText(val)
    }

    async function handleAction() {
        if (!text) {
            setResult({ result: false, feedback: 'Please enter a topic' })
            setDisplay(true)
            setTimeout(() => {
                setDisplay(false)
            }, 3000)
            return
        }

        const topic = await TopicManager({ topic: text, unsub: mode === Topic.Unsubscribe })

        if (topic) {
            setResult(topic)
            setDisplay(true)

            if (topic.result) {
                setText('')
                if (textInputRef.current) textInputRef.current.clear()
            }

            setTimeout(() => {
                setDisplay(false)
            }, topic.result ? 3000 : 10000)

        }
    }

    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '100%' }}>
                <TextInput style={{ ...TOPIC_MANAGER_STYLES.inputText, color: theme.textColor }}
                    ref={textInputRef}
                    placeholder={`Enter topic to ${mode ? 'subscribe to' : 'unsubscribe from'}...`}
                    placeholderTextColor={theme.titleTextColor}
                    textAlign='center'
                    onChangeText={(val) => handleText(val)}
                    selectionColor={theme.orange}
                />

                <TouchableOpacity onPress={() => setMode(prev => 1 - prev)}>
                    <Text style={{ ...T.centered10, color: theme.oppositeTextColor }}>
                        {copyText}
                    </Text>
                </TouchableOpacity>

                {display ? <Text style={{ ...TOPIC_MANAGER_STYLES.feedback, color: result.result ? 'green' : 'red' }}>
                    {result.feedback}
                </Text> : <Text style={{}}> </Text>}
            </View>
            <TouchableOpacity
                onPress={() => handleAction()}
                style={{ ...TOPIC_MANAGER_STYLES.touch, backgroundColor: theme.dark }}
            >
                <Image style={TOPIC_MANAGER_STYLES.dropImage} source={require('@assets/icons/plane-orange.png')} />
            </TouchableOpacity>
        </View>
    )
}
