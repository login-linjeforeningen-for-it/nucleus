import QueenbeeGate from '@components/menu/queenbee/gate'
import T from '@styles/text'
import { startLogin } from '@utils/auth/auth'
import { Text } from 'react-native'

export function UnauthorizedRetryText({ lang, theme }: { lang: boolean, theme: Theme }) {
    return (
        <Text style={{
            ...T.centered15,
            color: theme.oppositeTextColor,
            textAlign: 'center',
        }}>
            {lang ? 'Noe data er ikke tilgjengelig før du ' : 'Some data is not available until you '}
            <Text
                onPress={() => startLogin('queenbee')}
                style={{
                    color: theme.orange,
                    fontWeight: '500',
                    textDecorationLine: 'underline',
                }}
            >
                {lang ? 'logger inn på ny' : 'log in again'}
            </Text>
            .
        </Text>
    )
}

export function QueenbeeAccessGate({ login, hasQueenbee, theme }: { login: boolean, hasQueenbee: boolean, theme: Theme }) {
    return (
        <QueenbeeGate
            backgroundColor={theme.darker}
            textColor={theme.textColor}
            mutedTextColor={theme.oppositeTextColor}
            title='Queenbee'
            body={login && !hasQueenbee
                ? 'Your account is signed in, but it does not currently have Queenbee access.'
                : 'Sign in to use Queenbee.'}
            actionLabel={login ? undefined : 'Sign in'}
            actionColor={theme.orange}
            actionTextColor={theme.darker}
            onPress={login ? undefined : () => startLogin('queenbee')}
        />
    )
}
