import ES from '@styles/eventStyles'
import MS from '@styles/menuStyles'
import FilterCategoriesOrSkills from '@components/shared/filterOptions'
import { reset as resetAds, setInput as setAds } from '@redux/ad'
import { toggleSearch as adToggleSearch } from '@redux/ad'
import { JSX, useRef } from 'react'
import { useRoute } from '@react-navigation/native'
import HeaderIconButton from '@components/nav/headerIconButton'
import { BlurView } from 'expo-blur'
import { useSelector, useDispatch } from 'react-redux'
import {
    TouchableOpacity,
    TextInput,
    Image,
    View,
    Platform,
    StyleSheet,
} from 'react-native'
import {
    reset as resetEvents,
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

    return (
        <View style={isSearching ? { ...ES.filterPanel, top: 20 } : { display: 'none' }}>
            <View style={ES.filterPanelBody}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurMethod='dimezisBlurView'
                    intensity={Platform.OS === 'ios' ? 35 : 24}
                />
                <View style={{
                    ...StyleSheet.absoluteFill,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : theme.transparentAndroid,
                }} />
                <View style={ES.filterPanelContent}>
                    <View style={ES.filterSearchRow}>
                        <TextInput
                            ref={textInputRef}
                            style={{ ...ES.clusterFilterText, color: theme.textColor }}
                            maxLength={40}
                            placeholder={lang ? 'Søk..' : 'Search..'}
                            placeholderTextColor={theme.titleTextColor}
                            textAlign='center'
                            onChangeText={(val) => dispatch(isSearchingEvents ? setEvents(val) : setAds(val))}
                            selectionColor={theme.orange}
                        />
                        <TouchableOpacity
                            style={{
                                width: 38,
                                height: 38,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 19,
                                backgroundColor: '#ffffff08',
                            }}
                            onPress={() => {
                                if (isSearchingEvents) {
                                    dispatch(resetEvents())
                                }
                                if (isSearchingAds) {
                                    dispatch(resetAds())
                                }
                                if (textInputRef.current) textInputRef.current.clear()
                            }}
                        >
                            <Image style={ES.clusterFilterResetIcon} source={resetIcon} />
                        </TouchableOpacity>
                    </View>
                    <FilterCategoriesOrSkills />
                </View>
            </View>
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
        <HeaderIconButton active={!!isSearching} connector={!!isSearching} onPress={handlePress}>
            <Image
                style={MS.multiIcon}
                source={getFilterIcon({ hasFilterEnabled: !!hasFilterEnabled, isDark, isSearching })}
            />
        </HeaderIconButton>
    )
}

function getFilterIcon({ hasFilterEnabled, isDark, isSearching }: {
    hasFilterEnabled: boolean
    isDark: boolean
    isSearching: boolean
}) {
    if (isSearching) {
        return require('@assets/icons/filter-orange.png')
    }

    if (hasFilterEnabled) {
        return isDark
            ? require('@assets/icons/filter-active.png')
            : require('@assets/icons/filter-black-active.png')
    }

    return isDark
        ? require('@assets/icons/filter.png')
        : require('@assets/icons/filter-black.png')
}
