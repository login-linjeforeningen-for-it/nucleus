import { CategoryCircle, Title } from '@components/shared/category'
import ES from '@styles/eventStyles'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import { EventContext } from '@utils/contextProvider'
import { useContext } from 'react'

export default function Category() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    if (!event || !Object.keys(event).length) {
        return null
    }

    const categoryName = lang
        ? event.category.name_en || event.category.name_no
        : event.category.name_no || event.category.name_en

    return (
        <View style={{ ...ES.specificEventInfoView, top: 2.5 }}>
            <Title />
            <CategoryCircle color={event.category.color || ''} />
            <Text style={{
                ...T.specificEventInfo,
                maxWidth: '60%',
                color: theme.textColor
            }}>
                {categoryName}
            </Text>
        </View>
    )
}
