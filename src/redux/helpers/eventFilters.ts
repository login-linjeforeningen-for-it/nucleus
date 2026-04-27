type FilterProps = {
    input: string
    events: GetEventProps[]
    clickedEvents: GetEventProps[]
    clickedCategories: string[]
}

type FilterTextProps = {
    events: GetEventProps[]
    input: string
}

type FilterCategoriesProps = {
    events: GetEventProps[]
    clickedEvents: GetEventProps[]
    clickedCategories: string[]
}

export function setCategories(events: GetEventProps[], clickedEvents: GetEventProps[]) {
    const NO: Set<string> = new Set(clickedEvents.length ? ['Påmeldt'] : [])
    const EN: Set<string> = new Set(clickedEvents.length ? ['Enrolled'] : [])
    let englishCategoryExists = false

    events.forEach((event) => {
        if (event.category.name_no) {
            NO.add(event.category.name_no)
        }

        if (event.category.name_en) {
            EN.add(event.category.name_en)
            englishCategoryExists = true
        }
    })

    return {
        no: Array.from(NO).filter(Boolean),
        en: englishCategoryExists ? Array.from(EN).filter(Boolean) : []
    }
}

export function filterEvents({ input, events, clickedEvents, clickedCategories }: FilterProps) {
    if (input.length && clickedCategories.length) {
        const categoryFiltered = filterCategories({ events, clickedEvents, clickedCategories })
        return filterText({ events: categoryFiltered, input })
    }

    if (input.length) {
        return filterText({ events, input })
    }

    if (clickedCategories.length) {
        return filterCategories({ events, clickedEvents, clickedCategories })
    }

    return events
}

export function removeDuplicatesAndOld(APIevents: GetEventProps[], events: GetEventProps[]): GetEventProps[] {
    const realEvents = APIevents.filter(APIevent => events.some(event => APIevent.id === event.id))
    return realEvents.filter((event, index) => realEvents.findIndex(obj => obj.id === event.id) === index)
}

function filterText({ events, input }: FilterTextProps) {
    const needle = input.toLowerCase()
    const textFiltered = events.filter(event =>
        event.name_no.toLowerCase().includes(needle)
        || event.name_en.toLowerCase().includes(needle)
    )

    return removeDuplicatesAndOld(events, textFiltered)
}

function filterCategories({ events, clickedEvents, clickedCategories }: FilterCategoriesProps) {
    const clickedFound = clickedCategories.find((category: string) => category === 'Påmeldt')
    const categoryFiltered = events.filter(event =>
        clickedCategories.some((category: string) =>
            category === event.category.name_no
            || category === event.category.name_en
        ))

    if (!clickedFound) {
        return removeDuplicatesAndOld(events, categoryFiltered)
    }

    if (clickedCategories.length < 2) {
        return removeDuplicatesAndOld(events, clickedEvents)
    }

    return removeDuplicatesAndOld(events, categoryFiltered.concat(clickedEvents))
}
