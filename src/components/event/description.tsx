import Card from '@components/shared/card'
import Space from '@components/shared/utils'
import { Text, View } from 'react-native'
import DescriptionContent from './descriptionContent'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import Skeleton from '@components/shared/skeleton'
import { EventContext } from '@utils/app/contextProvider'
import { useContext } from 'react'

export default function Description() {
    const event = useContext(EventContext)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const loading = !(event && Object.keys(event).length)
    let name = ''

    if (event && Object.keys(event).length) {
        name = lang
            ? event.name_no || event.name_en
            : event.name_en || event.name_no
    }

    return (
        <Card>
            <Skeleton loading={loading} height={300}>
                <View>
                    <Space height={5} />
                    <Text style={{ ...T.text20, color: theme.textColor, fontWeight: 'bold' }}>
                        {name}
                    </Text>
                </View>
                <Space height={5} />
                <DescriptionContent />
                <Space height={10} />
            </Skeleton>
        </Card>
    )
}
