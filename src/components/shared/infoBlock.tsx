import { Text, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import infoSvg from '@assets/icons/info.svg'
import T from '@styles/text'
import { EventContext } from '@utils/app/contextProvider'
import { useContext } from 'react'

type InfoBlockProps = {
    text: string
    eventRelated?: boolean
}

type InfoProps = {
    text: string
}

export default function InfoBlock({ text, eventRelated }: InfoBlockProps) {
    if (eventRelated) return <Info text={text} />

    return (
        <View style={{
            backgroundColor: '#003946',
            minHeight: 50,
            width: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            flexDirection: 'row',
            alignItems: 'center',
        }}>
            <View style={{
                width: '15%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <SvgXml xml={infoSvg} color='#62c4d7' />
            </View>
            <Text style={{ color: '#ffffff', ...T.text16, paddingVertical: 10, width: '80%' }}>
                {text}
            </Text>
        </View>
    )
}

function Info({ text }: InfoProps) {
    const event = useContext(EventContext)

    if (!event || !Object.keys(event).length) {
        return null
    }

    return (
        <View style={{
            backgroundColor: event.canceled ? '#800000B3' : '#003946',
            minHeight: 50,
            width: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            flexDirection: 'row',
            alignItems: 'center',
        }}>
            <View style={{
                width: '15%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <SvgXml
                    xml={infoSvg}
                    color={event.canceled ? '#ff4040' : '#62c4d7'}
                />
            </View>
            <Text style={{
                color: '#ffffff',
                ...T.text20,
                paddingVertical: 10,
                width: '80%'
            }}>
                {text}
            </Text>
        </View>
    )
}
