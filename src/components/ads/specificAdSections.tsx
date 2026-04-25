import Cluster from "@components/shared/cluster"
import RenderDescription from "@components/ads/adDescription"
import Space from "@components/shared/utils"
import capitalizeFirstLetter from "@utils/capitalizeFirstLetter"
import config from "@/constants"
import LastFetch from "@/utils/fetch"
import T from "@styles/text"
import { Dimensions, Image, Linking, Pressable, Text, View } from "react-native"
import { SvgUri } from "react-native-svg"
import { useSelector } from "react-redux"

type SpecificAdSectionsProps = {
    ad: GetJobProps
}

export default function SpecificAdSections({ ad }: SpecificAdSectionsProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const unknownLabel = lang ? "Ukjent" : "Unknown"
    const shortDescription = lang
        ? formatText(ad.description_short_no || ad.description_short_en)
        : formatText(ad.description_short_en || ad.description_short_no)
    const longDescription = lang
        ? formatText(ad.description_long_no || ad.description_long_en)
        : formatText(ad.description_long_en || ad.description_long_no)
    const position = lang
        ? capitalizeFirstLetter(ad.position_title_no || ad.position_title_en)
        : capitalizeFirstLetter(ad.position_title_en || ad.position_title_no)
    const jobType = lang
        ? capitalizeFirstLetter(ad.job_type?.name_no || ad.job_type?.name_en)
        : capitalizeFirstLetter(ad.job_type?.name_en || ad.job_type?.name_no)
    const published = LastFetch(ad.time_publish)
    const updated = LastFetch(ad.updated_at)
    const deadline = LastFetch(ad.time_expire)
    const links = [
        { label: lang ? "Søk" : "Apply", url: ad.application_url || "", highlight: true },
        { label: lang ? "Nettside" : "Website", url: ad.organization?.link_homepage || "" },
        { label: "LinkedIn", url: ad.organization?.link_linkedin || "" },
        { label: "Instagram", url: ad.organization?.link_instagram || "" },
        { label: "Facebook", url: ad.organization?.link_facebook || "" },
    ].filter((item) => item.url.length)

    return (
        <>
            <HeroMedia ad={ad} />
            <Space height={10} />
            <SectionCard title={lang ? "Oversikt" : "Overview"}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    <MetaChip label={lang ? "Stilling" : "Position"} value={position || unknownLabel} />
                    <MetaChip label={lang ? "Type" : "Type"} value={jobType || unknownLabel} />
                    <MetaChip label={lang ? "Sted" : "Location"} value={formatList(ad.cities) || unknownLabel} />
                    <MetaChip label={lang ? "Frist" : "Deadline"} value={deadline} />
                </View>
            </SectionCard>
            <Space height={10} />
            {shortDescription ? (
                <>
                    <SectionCard title={lang ? "Kort fortalt" : "In short"}>
                        <Text style={{ ...T.paragraph, color: "#fff", lineHeight: 22 }}>
                            {shortDescription}
                        </Text>
                    </SectionCard>
                    <Space height={10} />
                </>
            ) : null}
            {Array.isArray(ad.skills) && ad.skills.length ? (
                <>
                    <SectionCard title={lang ? "Ferdigheter" : "Skills"}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {ad.skills.map((skill) => (
                                <View
                                    key={skill}
                                    style={{
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: "#ffffff14",
                                        backgroundColor: "#ffffff08",
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                    }}
                                >
                                    <Text style={{ ...T.text12, color: "#fff" }}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </SectionCard>
                    <Space height={10} />
                </>
            ) : null}
            {longDescription ? (
                <>
                    <SectionCard title={lang ? "Om stillingen" : "About the position"}>
                        <RenderDescription description={longDescription} />
                    </SectionCard>
                    <Space height={10} />
                </>
            ) : null}
            {links.length ? (
                <>
                    <SectionCard title={lang ? "Lenker" : "Links"}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                            {links.map((item) => (
                                <SocialButton
                                    key={`${item.label}-${item.url}`}
                                    label={item.label}
                                    url={item.url}
                                    highlight={item.highlight}
                                />
                            ))}
                        </View>
                    </SectionCard>
                    <Space height={10} />
                </>
            ) : null}
            <SectionCard title={lang ? "Publisering" : "Publishing"}>
                <View style={{ gap: 8 }}>
                    <Text style={{ ...T.text12, color: "#c8c8c8" }}>
                        {(lang ? "Publisert" : "Published") + `: ${published}`}
                    </Text>
                    <Text style={{ ...T.text12, color: "#c8c8c8" }}>
                        {(lang ? "Oppdatert" : "Updated") + `: ${updated}`}
                    </Text>
                    <Text style={{ ...T.text12, color: "#c8c8c8" }}>
                        {`Ad ID: ${ad.id}`}
                    </Text>
                </View>
            </SectionCard>
        </>
    )
}

function resolveAssetUrl(url: string | null | undefined, folder: "jobs" | "organizations") {
    if (!url) {
        return ""
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url
    }

    return `${config.cdn}/${folder}/${url.replace(/^\/+/, "")}`
}

function formatText(value: string | null | undefined) {
    return value ? value.replace(/\\n/g, "\n").trim() : ""
}

function formatList(value: string[] | null | undefined) {
    if (!Array.isArray(value) || !value.length) {
        return ""
    }

    return value.join(", ")
}

function SectionCard({
    title,
    children,
}: React.PropsWithChildren<{ title: string }>) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster marginHorizontal={12}>
            <View style={{ padding: 14 }}>
                <Text style={{ ...T.text18, color: theme.textColor, fontWeight: "700" }}>{title}</Text>
                <Space height={10} />
                {children}
            </View>
        </Cluster>
    )
}

function MetaChip({
    label,
    value,
}: {
    label: string
    value: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexBasis: "47%",
            flexGrow: 1,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#ffffff12",
            backgroundColor: "#ffffff08",
            padding: 12,
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor, marginBottom: 4 }}>{label}</Text>
            <Text style={{ ...T.text15, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function SocialButton({
    label,
    url,
    highlight,
}: {
    label: string
    url: string
    highlight?: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={() => void Linking.openURL(url)}
            style={{
                flexGrow: 1,
                minWidth: "30%",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: highlight ? theme.orange : "#ffffff14",
                backgroundColor: highlight ? theme.orange : "#ffffff08",
                paddingVertical: 10,
                paddingHorizontal: 12,
                alignItems: "center",
            }}
        >
            <Text style={{
                ...T.text15,
                color: highlight ? theme.textColor : theme.oppositeTextColor,
                fontWeight: "600"
            }}>
                {label}
            </Text>
        </Pressable>
    )
}

function HeroMedia({ ad }: SpecificAdSectionsProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const title = lang ? ad.title_no || ad.title_en : ad.title_en || ad.title_no
    const orgName = lang ? ad.organization?.name_no || ad.organization?.name_en : ad.organization?.name_en || ad.organization?.name_no
    const bannerUrl = resolveAssetUrl(ad.banner_image, "jobs")
    const logoUrl = resolveAssetUrl(ad.organization?.logo, "organizations")
    const width = Dimensions.get("window").width - 24

    return (
        <Cluster marginHorizontal={12}>
            <View style={{ padding: 14 }}>
                {bannerUrl ? (
                    bannerUrl.endsWith(".svg") ? (
                        <View style={{
                            borderRadius: 20,
                            backgroundColor: "#fff",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            paddingVertical: 12,
                            marginBottom: 14,
                        }}>
                            <SvgUri
                                width={width - 28}
                                height={(width - 28) / 2.4}
                                uri={bannerUrl}
                            />
                        </View>
                    ) : (
                        <Image
                            source={{ uri: bannerUrl, cache: "force-cache" }}
                            style={{
                                width: "100%",
                                aspectRatio: 2.2,
                                borderRadius: 20,
                                backgroundColor: "#101010",
                                marginBottom: 14,
                            }}
                            resizeMode="cover"
                        />
                    )
                ) : null}
                {orgName ? (
                    <Text style={{
                        ...T.text18,
                        color: theme.orange,
                        marginBottom: 10,
                    }}>
                        {orgName}
                    </Text>
                ) : null}
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                    {logoUrl ? (
                        logoUrl.endsWith(".svg") ? (
                            <View style={{
                                width: 74,
                                height: 64,
                                borderRadius: 14,
                                backgroundColor: "#fff",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}>
                                <SvgUri width={58} height={34} uri={logoUrl} />
                            </View>
                        ) : (
                            <View style={{
                                width: 74,
                                height: 64,
                                borderRadius: 14,
                                backgroundColor: "#fff",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}>
                                <Image
                                    source={{ uri: logoUrl, cache: "force-cache" }}
                                    style={{
                                        width: 66,
                                        height: 56,
                                    }}
                                    resizeMode="contain"
                                />
                            </View>
                        )
                    ) : null}
                    <View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
                        <Text style={{
                            ...T.text18,
                            color: theme.textColor,
                            lineHeight: 22,
                        }}>
                            {title}
                        </Text>
                    </View>
                </View>
            </View>
        </Cluster>
    )
}
