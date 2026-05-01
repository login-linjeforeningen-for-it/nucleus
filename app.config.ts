import { ExpoConfig, ConfigContext } from '@expo/config'

const publicUniversalLinkPaths = [
    '/events',
    '/career',
    '/profile',
    '/about',
    '/companies',
    '/ai',
    '/search',
    '/s',
    '/status',
    '/music',
    '/albums',
    '/fund',
    '/verv',
    '/policy',
    '/pwned',
    '/internal',
]

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    owner: 'loginapp',
    name: 'Login',
    slug: 'Login',
    version: '2.10.5',
    orientation: 'portrait',
    icon: './public/assets/logo/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
        image: './public/assets/logo/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#000000'
    },
    updates: {
        fallbackToCacheTimeout: 0,
        url: 'https://u.expo.dev/952a1914-0c53-43e7-b64e-8daab0b3a435'
    },
    plugins: [
        'expo-notifications',
        [
            'expo-calendar',
            {
                calendarPermission: 'Login wants to save events to your calendar.'
            }
        ],
        [
            'expo-build-properties',
            {
                ios: {
                    useFrameworks: 'static'
                },
                android: {
                    targetSdkVersion: 35
                }
            }
        ],
    ],
    assetBundlePatterns: [
        '**/*'
    ],
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.eirikhanasand.Login',
        buildNumber: config.ios?.buildNumber,
        associatedDomains: [
            'applinks:login.no',
            'applinks:www.login.no',
        ],
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
            NSPhotoLibraryAddUsageDescription: 'Login can save selected album images to your photo library when you ask it to.',
            UIBackgroundModes: [
                'fetch',
                'remote-notification'
            ],
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './public/assets/logo/adaptiveIcon.png',
            backgroundColor: '#000000'
        },
        package: 'com.login.Login',
        versionCode: config.android?.versionCode,
        permissions: [
            'INTERNET',
            'NOTIFICATIONS',
            'PUSH_NOTIFICATIONS',
            'READ_CALENDAR',
            'WRITE_CALENDAR'
        ],
        blockedPermissions: [
            'android.permission.READ_MEDIA_IMAGES',
            'android.permission.READ_MEDIA_VIDEO',
            'android.permission.READ_MEDIA_AUDIO',
            'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE',
            'android.permission.ACCESS_MEDIA_LOCATION'
        ],
        intentFilters: [
            {
                action: 'VIEW',
                autoVerify: true,
                data: publicUniversalLinkPaths.flatMap((pathPrefix) => [
                    {
                        scheme: 'https',
                        host: 'login.no',
                        pathPrefix,
                    },
                    {
                        scheme: 'https',
                        host: 'www.login.no',
                        pathPrefix,
                    },
                ]),
                category: [
                    'BROWSABLE',
                    'DEFAULT'
                ]
            }
        ],
        softwareKeyboardLayoutMode: 'pan'
    },
    web: {
        favicon: './public/assets/logo/icon.png'
    },
    extra: {
        eas: {
            projectId: '952a1914-0c53-43e7-b64e-8daab0b3a435'
        }
    },
    runtimeVersion: {
        policy: 'sdkVersion'
    }
})
