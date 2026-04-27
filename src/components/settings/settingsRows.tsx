import Cluster from '@/components/shared/cluster'
import Notification from '@/components/settings/notification'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { JSX } from 'react'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'

type InfoProps = {
    title: string
    description?: string
}

export function SectionHeader({ title }: { title: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ marginBottom: 8 }}>
            <Text style={{ ...T.text18, color: theme.orange, letterSpacing: 0.3 }}>
                {title}
            </Text>
        </View>
    )
}

export function SettingRow({
    title,
    description,
    control,
}: {
    title: string
    description?: string
    control: JSX.Element
}) {
    return (
        <Cluster marginHorizontal={0}>
            <SettingRowFrame accentOpacity={0.75}>
                <SettingText title={title} description={description} large />
                <SettingControl>{control}</SettingControl>
            </SettingRowFrame>
        </Cluster>
    )
}

export function SwitchCluster({ obj, category }: { obj: InfoProps, category: string }) {
    return (
        <View style={{ marginBottom: 8 }}>
            <Cluster marginHorizontal={0}>
                <SettingRowFrame accentOpacity={0.45}>
                    <SettingText title={obj.title} description={obj.description} />
                    <SettingControl>
                        <Notification category={category} />
                    </SettingControl>
                </SettingRowFrame>
            </Cluster>
        </View>
    )
}

function SettingRowFrame({
    accentOpacity,
    children,
}: React.PropsWithChildren<{ accentOpacity: number }>) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ ...GS.notificationBack, paddingVertical: 4 }}>
            <View style={{
                width: 3,
                alignSelf: 'stretch',
                borderRadius: 99,
                backgroundColor: theme.orange,
                marginRight: 10,
                opacity: accentOpacity,
            }} />
            {children}
        </View>
    )
}

function SettingText({ title, description, large }: InfoProps & { large?: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ ...(large ? T.text18 : T.text16), color: theme.textColor }}>
                {title}
            </Text>
            {description ? (
                <Text style={{ ...T.text12, color: theme.oppositeTextColor, lineHeight: 17, marginTop: 2 }}>
                    {description}
                </Text>
            ) : null}
        </View>
    )
}

function SettingControl({ children }: React.PropsWithChildren) {
    return (
        <View style={{
            ...GS.view2,
            minWidth: 52,
            marginLeft: 12,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {children}
        </View>
    )
}
