type GetCategoriesProps = {
    lang: boolean
    categories: {
        no: string[]
        en: string[]
    }
}

export function capitalizeFirstLetter(word: string | undefined): string {
    return word ? `${word?.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}` : ''
}

export function getCategories({ lang, categories }: GetCategoriesProps) {
    if (lang && categories.no.length) {
        return categories.no
    }

    if (!lang && categories.en && categories.en.length) {
        return categories.en
    }

    return categories.no
}

export function getHeight(length: number) {
    return length > 9 ? 100 : length > 6 ? 90 : length > 3 ? 60 : 30
}
