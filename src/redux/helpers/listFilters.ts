type IdentifiedItem = {
    id: number | string
}

type ListFilterProps<T extends IdentifiedItem> = {
    input: string
    items: T[]
    clickedItems: T[]
    selectedFilters: string[]
    matchesInput: (item: T, needle: string) => boolean
    matchesSelected: (item: T, selected: string) => boolean
}

export function setSkills(ads: GetJobProps[], clickedAds: GetJobProps[]) {
    const skills: Set<string> = new Set(clickedAds.length ? ['Påmeldt'] : [])

    ads.forEach((ad) => {
        ad.skills?.forEach(skill => skills.add(skill))
    })

    return Array.from(skills)
}

export function filterAds({ input, ads, clickedAds, clickedSkills }: {
    input: string
    ads: GetJobProps[]
    clickedAds: GetJobProps[]
    clickedSkills: string[]
}) {
    return filterList({
        input,
        items: ads,
        clickedItems: clickedAds,
        selectedFilters: clickedSkills,
        matchesInput: (ad, needle) =>
            ad.title_no.toLowerCase().includes(needle)
            || ad.title_en.toLowerCase().includes(needle),
        matchesSelected: (ad, skill) => Boolean(ad.skills?.includes(skill)),
    })
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

export function filterEvents({ input, events, clickedEvents, clickedCategories }: {
    input: string
    events: GetEventProps[]
    clickedEvents: GetEventProps[]
    clickedCategories: string[]
}) {
    return filterList({
        input,
        items: events,
        clickedItems: clickedEvents,
        selectedFilters: clickedCategories,
        matchesInput: (event, needle) =>
            event.name_no.toLowerCase().includes(needle)
            || event.name_en.toLowerCase().includes(needle),
        matchesSelected: (event, category) =>
            category === event.category.name_no
            || category === event.category.name_en,
    })
}

function filterList<T extends IdentifiedItem>({
    input,
    items,
    clickedItems,
    selectedFilters,
    matchesInput,
    matchesSelected,
}: ListFilterProps<T>) {
    if (input.length && selectedFilters.length) {
        const selectedItems = filterSelected(items, clickedItems, selectedFilters, matchesSelected)
        return filterText(selectedItems, input, matchesInput)
    }

    if (input.length) {
        return filterText(items, input, matchesInput)
    }

    if (selectedFilters.length) {
        return filterSelected(items, clickedItems, selectedFilters, matchesSelected)
    }

    return items
}

function filterText<T extends IdentifiedItem>(
    items: T[],
    input: string,
    matchesInput: (item: T, needle: string) => boolean,
) {
    const needle = input.toLowerCase()
    return removeDuplicatesAndOld(items, items.filter(item => matchesInput(item, needle)))
}

function filterSelected<T extends IdentifiedItem>(
    items: T[],
    clickedItems: T[],
    selectedFilters: string[],
    matchesSelected: (item: T, selected: string) => boolean,
) {
    const clickedFound = selectedFilters.find((filter: string) => filter === 'Påmeldt')
    const selectedItems = items.filter(item => selectedFilters.some(selected => matchesSelected(item, selected)))

    if (!clickedFound) {
        return removeDuplicatesAndOld(items, selectedItems)
    }

    if (selectedFilters.length < 2) {
        return removeDuplicatesAndOld(items, clickedItems)
    }

    return removeDuplicatesAndOld(items, selectedItems.concat(clickedItems))
}

function removeDuplicatesAndOld<T extends IdentifiedItem>(sourceItems: T[], filteredItems: T[]): T[] {
    const realItems = sourceItems.filter(sourceItem => filteredItems.some(item => sourceItem.id === item.id))
    return realItems.filter((item, index) => realItems.findIndex(obj => obj.id === item.id) === index)
}
