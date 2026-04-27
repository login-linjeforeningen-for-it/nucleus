type FilterProps = {
    input: string
    ads: GetJobProps[]
    clickedAds: GetJobProps[]
    clickedSkills: string[]
}

type FilterTextProps = {
    ads: GetJobProps[]
    input: string
}

type FilterCategoriesProps = {
    ads: GetJobProps[]
    clickedAds: GetJobProps[]
    clickedSkills: string[]
}

export function setSkills(ads: GetJobProps[], clickedAds: GetJobProps[]) {
    const skills: Set<string> = new Set(clickedAds.length ? ['Påmeldt'] : [])

    ads.forEach((ad) => {
        ad.skills?.forEach(skill => skills.add(skill))
    })

    return Array.from(skills)
}

export function filterAds({ input, ads, clickedAds, clickedSkills }: FilterProps) {
    if (input.length && clickedSkills.length) {
        const categoryFiltered = filterSkills({ ads, clickedAds, clickedSkills })
        return filterText({ ads: categoryFiltered, input })
    }

    if (input.length) {
        return filterText({ ads, input })
    }

    if (clickedSkills.length) {
        return filterSkills({ ads, clickedAds, clickedSkills })
    }

    return ads
}

export function removeDuplicatesAndOld(APIads: GetJobProps[], ads: GetJobProps[]): GetJobProps[] {
    const realAds = APIads.filter(APIad => ads.some(ad => APIad.id === ad.id))
    return realAds.filter((ad, index) => realAds.findIndex(obj => obj.id === ad.id) === index)
}

function filterText({ ads, input }: FilterTextProps) {
    const needle = input.toLowerCase()
    const textFiltered = ads.filter(ad =>
        ad.title_no.toLowerCase().includes(needle)
        || ad.title_en.toLowerCase().includes(needle)
    )

    return removeDuplicatesAndOld(ads, textFiltered)
}

function filterSkills({ ads, clickedAds, clickedSkills }: FilterCategoriesProps) {
    const clickedFound = clickedSkills.find((skill: string) => skill === 'Påmeldt')
    const skillFiltered = ads.filter(ad => clickedSkills.some((skill: string) => ad.skills?.includes(skill)))

    if (!clickedFound) {
        return removeDuplicatesAndOld(ads, skillFiltered)
    }

    if (clickedSkills.length < 2) {
        return removeDuplicatesAndOld(ads, clickedAds)
    }

    return removeDuplicatesAndOld(ads, skillFiltered.concat(clickedAds))
}
