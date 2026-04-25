import { Image, View, Text, TouchableOpacity } from "react-native"
import ChangeInfoCard from "@/components/profile/changeInfoCard"
import Cluster from "@/components/shared/cluster"
import CS from "@styles/clusterStyles"
import PS from "@styles/profileStyles"
import { useState } from "react"
import T from "@styles/text"
import { useSelector } from "react-redux"

type ProfileInfoProps = {
    profile: ProfileProps
}

type ProfileInfoContentProps = {
    type: string[]
    index: number
    profile: ProfileProps
    selectedIndex: number
}

/**
 * Function for drawing a very small square of the category of the event
 *
 * @param {string} category    Category of the event, Format: "CATEGORY"
 * @returns                     Small circle of the categories color
 */
export default function ProfileInfo({ profile }: ProfileInfoProps) {
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [profileInfo] = useState(profile)
    const profileInfoKeys = Object.keys(profileInfo)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    const typeNO = ["Studieretning", "Studieår", "Epost", "Preferanser", "Allergier"]
    const typeEN = ["Degree", "Study year", "Mail", "Preferences", "Allergies"]
    const type = lang ? typeNO : typeEN

    /**
     * @brief Handles click
     *
     * Handles click of all profileinfo items, and accounts for double clicks by
     * utilizing a previousIndex for cases where the same key is clicked multiple
     * times, for example if the user makes a typo and needs to change the same
     * thing again right away.
     *
     * @param {int} selectedIndex Stores clicked index
     * @param {int} index Index of most recent click
     */
    function handleClick(index: number) {
        if (selectedIndex === index) {
            setSelectedIndex(-1)
        } else {
            setSelectedIndex(index)
        }
    }

    return (
        <View>
            {profileInfoKeys.map((key, index) => (
                <View key={key}>
                    <TouchableOpacity onPress={() => handleClick(index)}>
                        <ProfileInfoContent
                            type={type}
                            index={index}
                            profile={profile}
                            selectedIndex={selectedIndex}
                        />
                    </TouchableOpacity>
                </View>
            ))}
            {selectedIndex > 0 &&
                <ChangeInfoCard
                    type={type[selectedIndex]}
                    value={selectedIndex}
                    hide={() => {
                        setSelectedIndex(-1)
                    }}
                    trigger={true}
                />
            }
        </View>
    )
}

function ProfileInfoContent({ type, index, profile, selectedIndex }:
    ProfileInfoContentProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const value = Object.values(profile)[index]
    const normalizedValue = Array.isArray(value)
        ? value.filter(Boolean).join(", ")
        : value
    const displayValue = typeof normalizedValue === "string" || typeof normalizedValue === "number"
        ? String(normalizedValue)
        : ""

    return (
        <Cluster noColor={true} marginHorizontal={12}>
            <View style={{ ...CS.clusterBack }}>
                <View style={CS.evenTwinLeft}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>
                        {type[index]}
                    </Text>
                </View>
                <View style={CS.evenTwinRight}>
                    <View style={{ ...CS.twinLeft, top: 6.75, left: -20 }}>
                        <Text style={{
                            ...T.text15,
                            textAlign: "right",
                            color: theme.oppositeTextColor
                        }}>
                            {displayValue || "—"}
                        </Text>
                    </View>
                    <View style={CS.twinRight}>
                        <Image
                            style={PS.editImage}
                            source={selectedIndex === index
                                ? require("@assets/icons/pencil-orange.png")
                                : require("@assets/icons/pencil777.png")}
                        />
                    </View>
                </View>
            </View>
        </Cluster>
    )
}
