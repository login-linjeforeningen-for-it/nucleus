import Embed from '@components/event/embed'
import { useMemo } from 'react'
import Markdown from 'react-native-markdown-display'
import { useSelector } from 'react-redux'

type RenderDescriptionProps = {
    description: string
}

export default function RenderDescription({ description }: RenderDescriptionProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    const content = useMemo(() => {
        if (!description) return null

        const embededEvent = /(\[:\w+\]\(\d+\))/
        const findNumber = /\((\d+)\)/
        const split = description.replace(/\\n/g, '<br>').split(embededEvent)

        return split.map((content, index) => {
            const match = content.match(findNumber)
            const number = match ? Number(match[1]) : null
            const markdown = content.replace(/<br>/g, '\n').replace(/###/g, '')

            if (!content.includes('[:event]') && !content.includes('[:jobad]')) {
                return <Markdown key={index} style={{ text: { color: '#FFF' } }}>{markdown}</Markdown>
            }

            return <Embed
                key={index}
                id={number}
                type={content.includes('[:event]') ? 'event' : 'ad'}
            />
        })
    }, [lang, description, theme.textColor])

    return content
}
