import { CheckBox, CheckedBox } from '@components/event/check'
import ES from '@styles/eventStyles'
import T from '@styles/text'
import { setClickedSkills } from '@redux/ad'
import { setClickedCategories } from '@redux/event'
import { getHeight } from '@utils/general'
import { useRoute } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'
import { Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

export default function FilterCategoriesOrSkills() {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const event = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const route = useRoute()
    const categories = [...getBestCategories(lang, event.categories)]
    const skills = [...ad.skills]
    const isFilteringOnEventScreen = event.search && route.name === 'EventScreen'
    const item = isFilteringOnEventScreen ? categories : skills
    const height = getHeight(item.length)

    return (
        <ScrollView
            style={{ height }}
            scrollEnabled={item.length > 9}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 2 }}
        >
            {item.map((text, index) => index % 3 === 0 ? (
                <View key={index / 3} style={{ flexDirection: 'row', marginHorizontal: -3 }}>
                    <FilterItem text={normalizeCategoryText(text || '', lang)} />
                    <FilterItem text={normalizeCategoryText(item[index + 1] || '', lang)} />
                    <FilterItem text={normalizeCategoryText(item[index + 2] || '', lang)} />
                </View>
            ) : null)}
        </ScrollView>
    )
}

function FilterItem({ text }: { text: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const event = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const dispatch = useDispatch()
    const route = useRoute()
    const isFilteringOnEventScreen = event.search && route.name === 'EventScreen'
    const checked = event.search && event.clickedCategories.includes(text) ||
        ad.search && ad.clickedSkills.includes(text)

    if (!text) return null

    function toggleFilterItem(item: string) {
        if (isFilteringOnEventScreen) {
            const nextCategories = checked
                ? event.clickedCategories.filter((category: string) => category !== item)
                : [...event.clickedCategories, item]
            dispatch(setClickedCategories(nextCategories))
            return
        }

        const nextSkills = checked
            ? ad.clickedSkills.filter((skill: string) => skill !== item)
            : [...ad.clickedSkills, item]
        dispatch(setClickedSkills(nextSkills))
    }

    return (
        <View style={ES.clusterCategoryView}>
            <TouchableOpacity style={{ width: '100%' }} onPress={() => toggleFilterItem(text)}>
                <View style={{ flexDirection: 'row', maxHeight: 50, minHeight: 30, alignItems: 'center', gap: 8, width: '100%' }}>
                    {checked ? <CheckedBox /> : <CheckBox />}
                    <Text style={{ ...T.text12, color: theme.titleTextColor, flex: 1 }}>
                        {text}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

function getBestCategories(lang: boolean, categories: { no: string[], en: string[] }) {
    if (lang) {
        return categories.no.length > categories.en.length ? categories.no : categories.en
    }

    return categories.en.length > categories.no.length ? categories.en : categories.no
}

function normalizeCategoryText(text: string, lang: boolean) {
    if (text === 'Påmeldt' || text === 'Enrolled') {
        return lang ? 'Påmeldt' : 'Enrolled'
    }

    return text
}
