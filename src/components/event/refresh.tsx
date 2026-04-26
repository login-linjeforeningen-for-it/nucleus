import { Image, Platform, View } from 'react-native'

type RefreshProps = {
    display: boolean
}

export default function Refresh({ display }: RefreshProps) {
    if (!display) return <></>

    return (
        <View style={{
            top: Platform.OS === 'ios' ? 59 : 0,
            height: -100,
            width: 30,
            marginVertical: 20,
            alignSelf: 'center'
        }}>
            <Image
                style={{ height: 30, width: 30 }}
                source={require('@assets/icons/refresh.gif')}
            />
        </View>
    )
}
