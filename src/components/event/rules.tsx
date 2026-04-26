import Markdown from '@components/course/markdown'
import Card from '@components/shared/card'
import { EventContext } from '@utils/contextProvider'
import { useContext } from 'react'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import { Text } from 'react-native'

export default function Rules() {
    const event = useContext(EventContext)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const rule = event && event.rule ?
        lang ? event.rule.description_no : event.rule.description_en
        : undefined

    if (!rule) {
        return <></>
    }

    const rules = `${rule?.replace(/\\n/g, '\n')}`

    return (
        <Card>
            <Text style={{
                ...T.text20,
                color: theme.textColor,
                fontWeight: 'bold'
            }}>
                Regler
            </Text>
            <Markdown fontSize={T.text15.fontSize} text={rules} />
        </Card>
    )
}
