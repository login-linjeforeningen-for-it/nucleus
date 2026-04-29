import Space, { Line } from '@/components/shared/utils'
import Person, { AllComitees } from '@/components/about/social'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { Dispatch, SetStateAction } from 'react'
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { useSelector } from 'react-redux'
import prkomSVG from '@assets/committee/prkom/pr-icon.svg'
import ctfkomSVG from '@assets/committee/ctfkom/ctfkom-icon.svg'
import evntkomSVG from '@assets/committee/evntkom/evntkom-icon.svg'
import satkomSVG from '@assets/committee/satkom/satkom-icon.svg'
import bedkomSVG from '@assets/committee/bedkom/bedkom-icon.svg'
import barkomSVG from '@assets/committee/barkom/barkom-icon.svg'
import tekkomSVG from '@assets/committee/tekkom/tekkom-icon.svg'
import styretSVG from '@assets/committee/styret/styret-icon.svg'

type CommitteeViewProps = {
    setCommittee: Dispatch<SetStateAction<number>>
    committee: number
}

type CommitteeContentProps = {
    index: number
    relevantCommittee: CommitteeInfo
}

export type CommitteeInfo = {
    id: number
    title: string
    quote: string
    description: string
}

const committeeImages = [
    styretSVG,
    evntkomSVG,
    tekkomSVG,
    prkomSVG,
    ctfkomSVG,
    satkomSVG,
    bedkomSVG,
    barkomSVG
]

export function CommitteeImage({ id, active, theme, style }: {
    style?: StyleProp<ViewStyle>
    id: number
    theme: Theme
    active: string
}) {
    const colors: { [key: string]: string } = {
        dark: '#ffffff',
        gray: '#555555',
        light: '#000000'
    }
    const barkomScaleStyle = id === 7 ? { transform: [{ scale: 1.05 }] } : undefined

    return (
        <SvgXml
            xml={committeeImages[id]}
            color={colors[active] || theme.orange}
            style={[style, barkomScaleStyle]}
        />
    )
}

export function CommitteePerson({ committee }: { committee: number }) {
    const committees = ['evntkom', 'tekkom', 'pr', 'ctf', 'eco', 'bedkom', 'barkom']

    if (committees[committee - 1]) {
        return <Person person={committees[committee - 1]} />
    }

    return <AllComitees />
}

export function CommitteeView({ setCommittee, committee }: CommitteeViewProps) {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const numRows = 1
    const numCols = Math.ceil(committeeImages.length / numRows)
    const rows = buildRows(numCols)

    return (
        <View style={{
            backgroundColor: theme.contrast,
            borderRadius: 16,
            paddingHorizontal: 10,
            paddingVertical: 10,
            marginBottom: 2
        }}>
            <View style={{
                display: 'flex',
                aspectRatio: numCols / numRows,
                justifyContent: 'space-between'
            }}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        {row.map((_, index) => {
                            const itemId = rowIndex * numCols + index
                            const isActive = committee === itemId

                            return (
                                <TouchableOpacity
                                    key={itemId}
                                    onPress={() => setCommittee(itemId)}
                                    style={{
                                        ...GS.committee,
                                        backgroundColor: isActive ? theme.greyTransparent : theme.darker,
                                        flex: 1,
                                        aspectRatio: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: isActive ? 1 : 0,
                                        borderColor: isActive ? theme.greyTransparentBorder : 'transparent',
                                    }}
                                >
                                    <CommitteeImage
                                        id={itemId}
                                        theme={theme}
                                        active={isActive ? '' : isDark ? 'dark' : 'gray'}
                                        style={{ width: '76%', aspectRatio: 1 }}
                                    />
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                ))}
            </View>
        </View>
    )
}

export function CommitteeContent({ index, relevantCommittee }: CommitteeContentProps) {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)

    return (
        <View key={index}>
            <Text style={{ ...T.text30, color: theme.textColor }}>
                <CommitteeImage
                    id={relevantCommittee.id}
                    style={GS.small}
                    theme={theme}
                    active={isDark ? 'dark' : 'gray'}
                />
                {relevantCommittee.title}
            </Text>
            {relevantCommittee.quote.length > 0 ? (
                <>
                    <Space height={10} />
                    <Line width={5}>
                        <Text style={{ ...T.boldWithLine, color: theme.textColor }}>
                            {relevantCommittee.quote}
                        </Text>
                    </Line>
                    <Space height={10} />
                </>
            ) : null}
            <Text style={{ ...T.paragraph, color: theme.textColor }}>
                {relevantCommittee.description}
            </Text>
            <Space height={15} />
        </View>
    )
}

function buildRows(numCols: number) {
    const rows: string[][] = []

    for (let i = 0; i < committeeImages.length; i += numCols) {
        rows.push(committeeImages.slice(i, i + numCols))
    }

    return rows
}
