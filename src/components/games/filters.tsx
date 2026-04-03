import T from "@styles/text"
import { Dispatch, SetStateAction } from "react"
import { Image, Platform, Text, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

type FiltersProps = {
    mode: number
    school: boolean
    ntnu: boolean
    setMode: Dispatch<SetStateAction<number>>
    setSchool: Dispatch<SetStateAction<boolean>>
    setNTNU: Dispatch<SetStateAction<boolean>>
    displaySchool: boolean
    displayNTNU: boolean
}

function Slash({ size }: { size: number }) {
    return (
        <View
            style={{
                position: "absolute",
                width: size,
                height: 2,
                backgroundColor: "red",
                transform: [{ rotate: "45deg" }],
                zIndex: 10,
                top: "50%",
                left: "50%",
                marginLeft: -size / 2,
                marginTop: -1
            }}
        />
    )
}

export default function Filters({
    mode,
    school,
    ntnu,
    setMode,
    setSchool,
    setNTNU,
    displaySchool,
    displayNTNU
}: FiltersProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const secondLine = displaySchool && displayNTNU

    const paddingHorizontal =
        lang
            ? Platform.OS === 'ios' ? 15 : 30
            : Platform.OS === 'ios' ? 25 : 40

    return (
        <>
            {/* MODE SELECTOR */}
            <View
                style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-evenly',
                    maxWidth: '80%',
                    position: 'absolute',
                    borderWidth: 2,
                    borderRadius: 4,
                    top: secondLine ? '5%' : '20%',
                    borderColor: theme.contrast,
                    overflow: 'hidden',
                }}
            >
                {[0, 1, 2].map((index) => (
                    <TouchableOpacity
                        key={index}
                        style={{
                            backgroundColor: mode === index ? theme.contrast : undefined,
                            paddingHorizontal,
                            paddingVertical: 2,
                        }}
                        onPress={() => setMode(index)}
                    >
                        <Text style={{ color: theme.textColor, ...T.text20 }}>
                            {lang
                                ? index === 0
                                    ? "Snill"
                                    : index === 1
                                        ? "Blandet"
                                        : "Dristig"
                                : index === 0
                                    ? "Kind"
                                    : index === 1
                                        ? "Mix"
                                        : "Bold"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ICON FILTERS */}
            {secondLine && <View
                style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-evenly',
                    maxWidth: '80%',
                    position: 'absolute',
                    top: '18%',
                }}
            >
                {/* SCHOOL */}
                {displaySchool && <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <TouchableOpacity onPress={() => setSchool(!school)}>
                        <Text style={{ color: theme.textColor, ...T.text30 }}>
                            🎓
                        </Text>
                    </TouchableOpacity>

                    {!school && <Slash size={35} />}
                </View>}

                {/* NTNU */}
                {displayNTNU && <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <TouchableOpacity onPress={() => setNTNU(!ntnu)}>
                        <Image
                            style={{ width: 50, height: 50 }}
                            source={require('@assets/icons/NTNU-black.png')}
                        />
                    </TouchableOpacity>

                    {!ntnu && <Slash size={50} />}
                </View>}
            </View>}
        </>
    )
}
