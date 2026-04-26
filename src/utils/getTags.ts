import no from '@text/tag/no.json'
import en from '@text/tag/en.json'

type getTagsProps = {
    event?: GetEventProps
    lang: boolean
}

/**
 * Returns an array of relevant tags for each event
 * @param event Event prop with all details
 * @param lang User set language of the app
 * @returns string array
 */
export default function getTags({ event, lang }: getTagsProps) {
    if (!event || !Object.keys(event).length) {
        return []
    }

    const description = lang ? event.description_no : event.description_en
    const title = lang ? event.name_no || event.name_en : event.name_en || event.name_no
    const storedTags = lang ? no : en
    const tags: Tag[] = []


    if (description) {
        if (description.toLowerCase().includes('prog & pils') && !Object.keys(tags).includes('P&P')) {
            tags.push(storedTags['P&P'])
        }

        if (description.toLowerCase().includes('prog og pils') && !Object.keys(tags).includes('P&P')) {
            tags.push(storedTags['P&P'])
        }

        if (
            (!event.canceled && description.includes('er avlyst'))
            || (description.includes('is cancel') && !tags.includes(storedTags.Cancelled))
        ) {
            tags.push(storedTags.Cancelled)
        }

        if (title.toLowerCase().includes('workshop')) tags.push(storedTags.Workshop)
    }

    if (event.canceled && !Object.keys(tags).includes('Cancelled')) tags.push(storedTags.Cancelled)
    if (event.highlight) tags.push(storedTags.Highlighted)
    if (event.name_no.toLowerCase().includes('ctf') && (
        event.name_no.toLowerCase().includes('with') ||
        event.name_no.toLowerCase().includes('med')
    ) && event.name_no.toLowerCase().includes('ctf')) tags.push(storedTags.BedCTF)
    if (event.name_no.toLowerCase().includes('cyberdag')) tags.push(storedTags.Cyberdays)

    return tags
}
