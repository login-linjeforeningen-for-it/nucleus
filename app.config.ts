import { ExpoConfig, ConfigContext } from '@expo/config'

const publicUniversalLinkPaths = [
    '/events',
    '/career',
    '/about',
    '/companies',
    '/albums',
    '/fund',
    '/verv',
    '/policy',
    '/pwned',
]

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    owner: "loginapp",
    name: "Login",
    slug: "Login",
    version: "2.5.3",
    orientation: "portrait",
    icon: "./public/assets/logo/icon.png",
    userInterfaceStyle: "dark",
    splash: {
        image: "./public/assets/logo/splash.png",
        resizeMode: "contain",
        backgroundColor: "#000000"
    },
    updates: {
        fallbackToCacheTimeout: 0,
        url: "https://u.expo.dev/952a1914-0c53-43e7-b64e-8daab0b3a435"
    },
    plugins: [
        "expo-notifications",
        [
            "expo-calendar",
            {
                calendarPermission: "Login wants to save events to your calendar."
            }
        ],
        [
            "expo-build-properties",
            {
                ios: {
                    useFrameworks: "static"
                },
                android: {
                    targetSdkVersion: 35
                }
            }
        ],
        [
            "expo-image-picker",
            {
                photosPermission: "Login needs photo access if you want a profile picture.",
                cameraPermission: "Login needs camera access if you want to take a selfie."
            }
        ]
    ],
    assetBundlePatterns: [
        "**/*"
    ],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.eirikhanasand.Login",
        buildNumber: config.ios?.buildNumber,
        associatedDomains: [
            "applinks:login.no",
            "applinks:www.login.no",
        ],
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
            UIBackgroundModes: [
                "fetch",
                "remote-notification"
            ],
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./public/assets/logo/adaptiveIcon.png",
            backgroundColor: "#000000"
        },
        package: "com.login.Login",
        versionCode: config.android?.versionCode,
        permissions: [
            "INTERNET",
            "NOTIFICATIONS",
            "PUSH_NOTIFICATIONS",
            "READ_CALENDAR",
            "WRITE_CALENDAR"
        ],
        intentFilters: [
            {
                action: "VIEW",
                autoVerify: true,
                data: publicUniversalLinkPaths.flatMap((pathPrefix) => [
                    {
                        scheme: "https",
                        host: "login.no",
                        pathPrefix,
                    },
                    {
                        scheme: "https",
                        host: "www.login.no",
                        pathPrefix,
                    },
                ]),
                category: [
                    "BROWSABLE",
                    "DEFAULT"
                ]
            }
        ],
        softwareKeyboardLayoutMode: "pan"
    },
    web: {
        favicon: "./public/assets/logo/favicon.ico"
    },
    extra: {
        eas: {
            projectId: "952a1914-0c53-43e7-b64e-8daab0b3a435"
        }
    },
    runtimeVersion: {
        policy: "sdkVersion"
    }
})
