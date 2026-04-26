import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

type handleRefreshProps = {
    event: NativeSyntheticEvent<NativeScrollEvent>
    setRefresh: (value: React.SetStateAction<boolean>) => void
    getDetails: () => Promise<true | undefined>
}

export default function handleRefresh({ event, setRefresh, getDetails }: handleRefreshProps) {
    const currentScrollOffset = event.nativeEvent.contentOffset.y

    if (currentScrollOffset < -70) {
        (async () => {
            setRefresh(true)
            let working = true

            while (working) {
                const response = await getDetails()
                if (response) {
                    working = false
                    setRefresh(false)
                }
            }
        })()
    }
}
