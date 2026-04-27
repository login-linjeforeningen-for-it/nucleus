import { View } from 'react-native'
import Cluster from '@/components/shared/cluster'
import { useSelector } from 'react-redux'
import { Field } from './field'
import buildSummaryFields from '@utils/profile/buildSummaryFields'

type ProfileInfoProps = {
    profile: Profile | null
}

/**
 * Function for drawing a very small square of the category of the event
 *
 * @param {string} category    Category of the event, Format: "CATEGORY"
 * @returns                     Small circle of the categories color
 */
export default function ProfileInfo({ profile }: ProfileInfoProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const fields = buildSummaryFields(profile, lang)

    return (
        <Cluster noColor={true} marginHorizontal={12}>
            <View style={{ gap: 12, width: '100%' }}>
                {fields.map((field) => (
                    <Field
                        key={field.title}
                        theme={theme}
                        title={field.title}
                        text={field.text}
                        copyValue={field.copyValue}
                        verified={field.verified}
                        wrapEvery={field.wrapEvery}
                    />
                ))}
            </View>
        </Cluster>
    )
}
