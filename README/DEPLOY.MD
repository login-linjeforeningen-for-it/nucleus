-- -- -- -- LOCAL TESTING -- -- -- --
1. Make sure that both your host (computer) and testing device (phone / emulator) is on the same wifi or cellular connection.
2. Start the project using "npx expo start".
3. Open the project on your phone using the Expo Go application (download from App Store or Google Play) and start developing.
4. Resolve all errors that arise during development.
5. Test every changed part for both iOS and Android.
6. Run "npx expo-doctor" to check for any errors.

-- -- -- -- PHYSICAL TESTING -- -- -- --
1. Complete local testing
2. Increment the version numbers in app.json. For ios its "buildNumber" and for android its "versionCode" and version at the top. First digit for major overhauls. Second digit for larger updates and 3rd digit for small updates.
3. Verify Expo notifications with a physical device.

-- -- -- -- Ios - Local -- -- -- --
1. Build for ios first using "eas build -p ios --local" (local) or "eas build -p ios --auto-submit" (cloud).
2. Log into the Apple Developer Account.
3. Download the app from Testflight.
4. Test the application on a physical iPhone.

-- -- -- Android - Remote -- -- --
1. Build the app for android using "eas build -p android".
2. Go to the Expo Developer dashboard and verify that the build has succeeded.
3. Download the finished build.
4. Test the Android build on a physical Android device.
5. Push the repository to remote after physical Android testing.

-- -- -- Android - Local -- -- --

-- -- -- Windows -- -- --
1. Download android studio
2. Run "npx expo prebuild"
3. Get the keystore by runninng "eas credentials"
4. Select "android"
5. Select "production"
6. Select "keystore"
7. Select "download"
8. Select "build credentials"
9. Select yes
10. Copy the keystore password, Key alias, Key password and Path to keystore
11. Open android studio and select the generated android folder as the project
12. Go to Build->Build signed packege
13. Select apk
14. Select the keystore from eas, and fill in the credentials for the keystore
15. Build the apk. The output is in android/build/output/debug
16. Install the Android build on a physical Android device.
17. Push the repository to remote after physical Android testing.


-- -- -- -- RELEASE -- -- -- --
14. Submit it to Google Play for review and auto release.
15. Submit it to App Store for review and auto release.

Notes:
1. You can build for android first, if so do the steps relevant for Android first, then the iOS steps afterwards.
2. You can test using emulators, but physical devices are recommended as emulators gives limited functionality and can give bugs that are not present on physical devices.
3. Emulators do NOT support notifications.
