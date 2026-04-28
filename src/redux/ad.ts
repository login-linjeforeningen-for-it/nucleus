import { createSlice } from '@reduxjs/toolkit'
import { filterAds, setSkills } from './helpers/listFilters'

export const AdSlice = createSlice({
    name: 'ad',
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
            state.renderedAds = filterAds({
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
            state.renderedAds = filterAds({
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
