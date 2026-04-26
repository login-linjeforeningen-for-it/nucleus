import { Image, Platform, Text, TouchableOpacity, View } from 'react-native'
import GS from '@styles/globalStyles'
import { useSelector } from 'react-redux'
import { setTag } from '@redux/event'
import { useDispatch } from 'react-redux'
import getTags from '@utils/getTags'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

type TagsProps = {
    event: GetEventProps | undefined
}

export default function Tags({ event }: TagsProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const tags = getTags({ event, lang })

    if (!event || !Object.keys(event).length) {
        return null
    }


    return (
        <View style={{ flexDirection: 'row' }}>
            {tags.map((tag) => <Tag tag={tag} theme={theme} key={tag.title} />)}
        </View>
    )
}

function Tag({ tag, theme }: { tag: Tag, theme: Theme }) {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const dispatch = useDispatch()

    return (
        <View style={{ left: 12, marginRight: 5, top: Platform.OS === 'ios' ? 4 : 3 }}>
            <TouchableOpacity onPress={() => {
                navigation.navigate('InfoModal')
                dispatch(setTag(tag))
            }}>
                <View style={{
                    backgroundColor: theme.orangeTransparent,
                    flexDirection: 'row',
                    alignSelf: 'baseline',
                    padding: 3,
                    borderRadius: 5,
                    paddingHorizontal: 5
                }}>
                    <Text style={{ color: theme.orange, marginRight: 5 }}>{tag.title}</Text>
                    <Image style={GS.tag} source={require('@assets/icons/tag.png')} />
                </View>
            </TouchableOpacity>
        </View>
    )
}
