type getCategoriesProps = {
    lang: boolean
    categories: {
        no: string[]
        en: string[]
    }
}

export default function getCategories({ lang, categories }: getCategoriesProps) {

    if (lang && categories.no.length) {
        return categories.no
    }

    if (!lang && categories.en && categories.en.length) {
        return categories.en
    }

    return categories.no
}
