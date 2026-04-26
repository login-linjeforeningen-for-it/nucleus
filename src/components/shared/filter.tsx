import ES from '@styles/eventStyles'
import getHeight from '@utils/getHeight'
import MS from '@styles/menuStyles'
import T from '@styles/text'
import { CheckBox, CheckedBox } from '@components/event/check'
import { reset as resetAds, setInput as setAds } from '@redux/ad'
import { toggleSearch as adToggleSearch } from '@redux/ad'
import { ScrollView } from 'react-native-gesture-handler'
import { setClickedSkills } from '@redux/ad'
import { JSX, useRef } from 'react'
import { useRoute } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import {
    TouchableOpacity,
    TextInput,
    Image,
    View,
    Text,
    Dimensions,
    Platform,
} from 'react-native'
import {
    reset as resetEvents,
    setClickedCategories,
    setInput as setEvents,
    toggleSearch as eventToggleSearch
} from '@redux/event'

/**
 * User interface for the filter
 * @returns Filter UI
 */
export function FilterUI(): JSX.Element {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { search } = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const resetIcon = isDark
        ? require('@assets/icons/reset.png')
        : require('@assets/icons/reset-black.png')
    const dispatch = useDispatch()
    const textInputRef = useRef<TextInput | null>(null)
    const route = useRoute()
    const isSearchingEvents = route.name === 'EventScreen' && search
    const isSearchingAds = route.name === 'AdScreen' && ad.search
    const isSearching = isSearchingEvents || isSearchingAds
    const top = (isSearchingAds && 35) || Platform.OS === 'ios' ? 40 : 35

    return (
        <View style={isSearching ? { top } : { display: 'none' }}>
            <View style={ES.absoluteView}>
                <TextInput
                    ref={textInputRef}
                    style={{ ...ES.clusterFilterText }}
                    maxLength={40}
                    placeholder={lang ? 'Søk..' : 'Search..'}
                    placeholderTextColor={theme.titleTextColor}
                    textAlign='center'
                    onChangeText={(val) => dispatch(isSearchingEvents ? setEvents(val) : setAds(val))}
                    selectionColor={theme.orange}
                />
                <TouchableOpacity onPress={() => {
                    if (isSearchingEvents) {
                        dispatch(resetEvents())
                    }
                    if (isSearchingAds) {
                        dispatch(resetAds())
                    }
                    if (textInputRef.current) textInputRef.current.clear()
                }}>
                    <Image style={ES.clusterFilterResetIcon} source={resetIcon} />
                </TouchableOpacity>
            </View>
            <FilterCategoriesOrSkills />
        </View>
    )
}

/**
 * Displays the filter button
 * @returns Filter button
 */
export function FilterButton() {
    const { isDark } = useSelector((state: ReduxState) => state.theme)
    const { search, clickedCategories, input } = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const dispatch = useDispatch()
    const route = useRoute()
    const isSearching = route.name === 'EventScreen' && search || route.name === 'AdScreen' && ad.search
    const filtered = clickedCategories.length || ad.clickedSkills.length || input.length || ad.input.length
    const hasFilterEnabled = (route.name === 'EventScreen' || route.name === 'AdScreen')
        && filtered

    function handlePress() {
        if (route.name === 'EventScreen') {
            dispatch(eventToggleSearch())
        }
        if (route.name === 'AdScreen') {
            dispatch(adToggleSearch())
        }
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            {isSearching
                ? <Image
                    style={MS.multiIcon}
                    source={require('@assets/icons/filter-orange.png')}
                />
                :
                hasFilterEnabled
                    ?
                    <Image
                        style={MS.multiIcon}
                        source={isDark
                            ? require('@assets/icons/filter-active.png')
                            : require('@assets/icons/filter-black-active.png')}
                    />
                    :
                    <Image
                        style={MS.multiIcon}
                        source={isDark
                            ? require('@assets/icons/filter.png')
                            : require('@assets/icons/filter-black.png')
                        }
                    />
            }
        </TouchableOpacity>
    )
}

/**
 * Displays the filter checkboxes for categories or skills
 * @returns
 */
function FilterCategoriesOrSkills() {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const event = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const route = useRoute()
    const cat = bestCategories()

    function bestCategories() {
        if (lang) {
            if (event.categories.no.length > event.categories.en.length) {
                return event.categories.no
            } else {
                return event.categories.en
            }
        } else {
            if (event.categories.en.length > event.categories.no.length) {
                return event.categories.en
            } else {
                return event.categories.no
            }
        }
    }

    // Clones cat because it is read only
    const categories = [...cat]
    const skills = [...ad.skills]
    const isFilteringOnEventScreen = event.search && route.name === 'EventScreen'
    const item = isFilteringOnEventScreen ? categories : skills
    const height = getHeight(item.length)

    return (
        <ScrollView
            style={{ height }}
            scrollEnabled={item.length > 9 ? true : false}
            showsVerticalScrollIndicator={false}
        >
            {item.map((text, index) => {
                if (text === 'Påmeldt' || text === 'Enrolled') {
                    text = lang ? 'Påmeldt' : 'Enrolled'
                }

                if (index % 3 === 0) {
                    return (
                        <View key={index / 3} style={{ flexDirection: 'row' }}>
                            <FilterItem text={text || ''} />
                            <FilterItem text={item[index + 1] || ''} />
                            <FilterItem text={item[index + 2] || ''} />
                        </View>
                    )
                }
                return null
            })}
        </ScrollView>
    )
}

/**
 * Displays a small checkbox in the filter UI.
 * @param text Text to display on the screen
 */
function FilterItem({ text }: { text: string }) {
    if (!text) return null

    const { theme } = useSelector((state: ReduxState) => state.theme)
    const event = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const dispatch = useDispatch()
    const route = useRoute()
    const isFilteringOnEventScreen = event.search && route.name === 'EventScreen'
    const checked = event.search && event.clickedCategories.includes(text) ||
        ad.search && ad.clickedSkills.includes(text)

    function handleUnchecked(item: string) {
        if (isFilteringOnEventScreen) {
            dispatch(setClickedCategories(event.clickedCategories.filter((category: string) => category !== item)))
        } else {
            dispatch(setClickedSkills(ad.clickedSkills.filter((skill: string) => skill !== item)))
        }
    }

    function handleChecked(item: string) {
        if (isFilteringOnEventScreen) {
            dispatch(setClickedCategories([...event.clickedCategories, item]))
        } else {
            dispatch(setClickedSkills([...ad.clickedSkills, item]))
        }
    }

    return (
        <View style={ES.clusterCategoryView}>
            <TouchableOpacity onPress={() => checked ? handleUnchecked(text) : handleChecked(text)}>
                <View style={{
                    flexDirection: 'row',
                    maxHeight: 50,
                    minHeight: 30,
                    alignItems: 'center',
                    width: Dimensions.get('window').width / 4
                }}>
                    {checked ? <CheckedBox /> : <CheckBox />}
                    <Text style={{
                        ...T.filterCategoryText,
                        color: theme.titleTextColor
                    }}>
                        {text}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}
