import { View, Dimensions, Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import ThemeSwitch from '@/components/settings/themeSwitch'
import Reminders from '@/components/settings/reminders'
import Language from '@/components/settings/language'
import Space from '@/components/shared/utils'
import GS from '@styles/globalStyles'
import { useSelector } from 'react-redux'
import en from '@text/menu/settings/en.json'
import no from '@text/menu/settings/no.json'
import Swipe from '@components/nav/swipe'
import { JSX } from 'react'
import { SectionHeader, SettingRow, SwitchCluster } from '@/components/settings/settingsRows'

export default function SettingScreen(): JSX.Element {

    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Swipe left='MenuScreen'>
            <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                <Content />
            </View>
        </Swipe>
    )
}

function Content(): JSX.Element {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const info = lang ? no.info : en.info
    const height = Dimensions.get('window').height
    const extraHeight = Platform.OS === 'ios' ? 0 : height > 800 && height < 900 ? 20 : 10

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 6 }}>
            <Space height={Dimensions.get('window').height / 8.1 + extraHeight} />
            <SettingRow
                title={info[0].title}
                description={info[0].description}
                control={<ThemeSwitch />}
            />

            <SettingRow
                title={info[1].title}
                description={info[1].description}
                control={<Language />}
            />

            <Space height={12} />
            <SectionHeader title={info[2].title} />
            <SwitchCluster obj={info[3]} category='IMPORTANT' />
            <Space height={12} />
            <SectionHeader title={info[4].title} />
            <SwitchCluster obj={info[5]} category='BEDPRES' />
            <SwitchCluster obj={info[6]} category='TEKKOM' />
            <SwitchCluster obj={info[7]} category='CTF' />
            <SwitchCluster obj={info[8]} category='SOCIAL' />
            <SwitchCluster obj={info[9]} category='KARRIEREDAG' />
            <SwitchCluster obj={info[10]} category='FADDERUKA' />
            <SwitchCluster obj={info[11]} category='LOGIN' />
            <SwitchCluster obj={info[12]} category='ANNET' />
            <Space height={12} />
            <SectionHeader title={info[13].title} />
            <Reminders />
            <Space height={Dimensions.get('window').height / (Platform.OS === 'ios' ? 9 : 7)} />
        </ScrollView>
    )
}
