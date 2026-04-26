import { createSlice } from '@reduxjs/toolkit'

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

type filterBothProps = {
    clickedSkills: string[]
    clickedAds: GetJobProps[]
    ads: GetJobProps[]
    input: string
}

// Declares the ad slice
export const AdSlice = createSlice({
    // Names the slice as "ad"
    name: 'ad',
    // Initial state of the slice
    initialState: {
        ads: [] as GetJobProps[],
        adName: '',
        history: [] as number[],
        clickedAds: [] as GetJobProps[],
        renderedAds: [] as GetJobProps[],
        lastFetch: '',
        lastSave: '',
        search: false,
        skills: [] as string[],
        clickedSkills: [] as string[],
        input: '',
        downloadState: '',
    },
    // Declares reducers
    reducers: {
        // Sets the ad array
        setAds(state, action) {
            state.ads = action.payload
            state.skills = setSkills(state.ads, state.clickedAds)

            if (!state.search) {
                state.renderedAds = action.payload
            }
        },
        // Sets the ad to be displayed on SAS
        setAdName(state, action) {
            state.adName = action.payload
        },
        // Sets the clicked ads
        setClickedAds(state, action) {
            state.clickedAds = action.payload
            state.skills = setSkills(state.ads, state.clickedAds)
        },
        setHistory(state, action) {
            state.history = action.payload
        },
        // Sets the ads to be displayed
        setRenderedAds(state, action) {
            state.renderedAds = action.payload
        },
        // Stores the time of the most recent successful API call
        setLastFetch(state, action) {
            state.lastFetch = action.payload
        },
        // Stores the time of the most recent save to calendar
        setLastSave(state, action) {
            state.lastFetch = action.payload
        },
        // Toggles the filter visibility
        toggleSearch(state) {
            state.search = !state.search
        },
        // Sets the clicked skills inside of the filter
        setClickedSkills(state, action) {
            state.clickedSkills = action.payload
            state.renderedAds = Filter({
                input: state.input,
                ads: state.ads,
                clickedAds: state.clickedAds,
                clickedSkills: state.clickedSkills
            })
        },
        // Resets states after searching
        reset(state) {
            state.input = ''
            state.renderedAds = state.ads
            state.clickedSkills = []
        },
        // Sets the search input
        setInput(state, action) {
            state.input = action.payload
            state.renderedAds = Filter({
                input: state.input,
                ads: state.ads,
                clickedAds: state.clickedAds,
                clickedSkills: state.clickedSkills
            })
        },
        setDownloadState(state) {
            state.downloadState = new Date().toString()
        }
    }
})

// Exports functions
export const {
    reset,
    setClickedSkills,
    setClickedAds,
    setAds,
    setAdName,
    setHistory,
    setInput,
    setLastFetch,
    setLastSave,
    setRenderedAds,
    toggleSearch,
    setDownloadState,
} = AdSlice.actions

// Exports the Ad slice itself
export default AdSlice.reducer

/**
 * Updates relevant skills to filter
 * @param clickedAds
 * @param ads
 */
function setSkills(ads: GetJobProps[], clickedAds: GetJobProps[]) {
    // Adds enrolled (Påmeldt) filter option if relevant, since no ad has this attribute naturally
    const skills: Set<string> = new Set(clickedAds.length ? ['Påmeldt'] : [])

    ads.forEach((ad) => {
        if (ad.skills) {
            ad.skills.forEach(skill => {
                skills.add(skill)
            })
        }
    })

    return Array.from(skills)
}

// --- PARENT FILTER FUNCTION ---
function Filter({ input, ads, clickedAds, clickedSkills }: FilterProps) {
    // Filters both on input and clicked skills if both are provided
    if (input.length && clickedSkills.length) {
        return filterBoth({ clickedSkills, clickedAds, ads, input })
        // Filters on text if only text is provided
    } else if (input.length) {
        return filterText({ ads, input })
        // Filters on categories if only categories are provided
    } else if (clickedSkills.length) {
        return filterSkills({ ads, clickedAds, clickedSkills })
    }

    // Returns ads if there is nothing to be filtered
    return ads
}

/**
 * Filters ads based on if they include the passed text, will include both
 * matches for the Norwegian and English title.
 * @param ads Ads to filter
 * @param input Text to filter based on
 * @returns Filtered ads
 */
function filterText({ ads, input }: FilterTextProps) {
    const textFiltered = ads.filter(ad =>
        ad.title_no.toLowerCase().includes(input.toLowerCase())
        || ad.title_en.toLowerCase().includes(input.toLowerCase())
    )

    return removeDuplicatesAndOld(ads, textFiltered)
}

/**
 * Filters ads based on of their skills is in the clickedSkills array
 * @param ads Ads to filter
 * @param clickedAds Ads clicked by the user
 * @param clickedSkills Skills clicked by the user
 * @returns Ads filtered by skills
 */
function filterSkills({ ads, clickedAds, clickedSkills }: FilterCategoriesProps) {

    // Checks if user is filtering by enrolled (PÅMELDT)
    const clickedFound = clickedSkills.find((skill: string) => skill === 'Påmeldt')

    // Filters based on category
    const skillFiltered = ads.filter(ad => clickedSkills.some((skill: string) => ad.skills?.includes(skill)))

    // Returns if the user is not enrolled to any ads
    if (!clickedFound) {
        return removeDuplicatesAndOld(ads, skillFiltered)
    }

    // Returns clickedAds if the user has only clicked this
    if (clickedSkills.length < 2) {
        return removeDuplicatesAndOld(ads, clickedAds)
    }

    // Combines skillFiltered and concatenatedArray and returns them without duplicates
    return removeDuplicatesAndOld(ads, skillFiltered.concat(clickedAds))
}

/**
 * Filters ads based on both skills and text input
 * @param clickedSkills Skills clicked by the user
 * @param clickedAds Ads clicked by the user
 * @param ads Ads to filter
 * @param input
 * @returns Ads filtered by both skills and text
 */
function filterBoth({ clickedSkills, clickedAds, ads, input }: filterBothProps) {
    const categoryFiltered = filterSkills({ ads, clickedAds, clickedSkills })
    const textFiltered = filterText({ ads: categoryFiltered, input })
    return removeDuplicatesAndOld(ads, textFiltered)
}

/**
* Function for removing old ads and duplicates
*
* @param APIads Ads from API
* @param ads Ads to filter
* @returns Filtered ads
*/
export function removeDuplicatesAndOld(APIads: GetJobProps[], ads:
GetJobProps[]): GetJobProps[] {

    // Removes old ads and preserves newer version of all ads
    const realAds = APIads.filter(APIad =>
        ads.some(ad => APIad.id === ad.id))

    // Removes duplicates
    const filteredAds = realAds.filter((ad, index) => {
        return realAds.findIndex(obj => obj.id === ad.id) === index
    })

    return filteredAds
}
