-- -- -- -- EXPO -- -- -- --
Trying to access native module?
Confirm the feature is supported by Expo Go or run a development build. Nucleus
uses Expo notifications instead of deprecated native service-file configuration.

App crashes in Expo without any feedback?
Likely there is a type issue, for example you have given a number where you need
to give a string. To solve this issue use debug tools to inspect all variables
and find the mismatch. To permanently avoid this issue, switch to typescript.

Connection issue warnings?
Likely a bug or weakness in your connection line. Safe to ignore as the app
utalizes caching, and a lack of connection will have little consequence. To
permanently resolve, set up error handling and display a warning to their user
letting them know that their connection line is weak.

App crashes on touch or when doing a specific task in the app?
Likely a dependency is missing or not imported properly, make sure all
dependencies and functions are defined and imported correctly.

Not working for no reason?
First delete node_modules, then empty the npm cache, then restart the computer,
then run "npm install" in the root of the repository. If it is still not working
you have either found an unlucky bug, or (more likely) your code has an error
due to something you took for granted not really being granted. Review your code
carefully.

Non-std c++ exception?
This is usually thrown when there is an issue while parsing a JSON file, for
example if a string is not terminated correctly.

-- -- -- -- TESTFLIGHT -- -- -- --
App crashes in Testflight without any feedback?
Likely there is a dependency conflict that is not visible, even when running
"npx expo-doctor". To solve this issue, revert all dependencies to their latest
stable state (latest state that actually worked), and update them one at a time,
until you find the one causing the issue. File a issue on Github if it is a bug,
so that the owner of the repository can resolve the issue.

Invalid version numbers or version number already used?
You forgot to update the version number before you built the ipa or aab file.
Increment the version numbers as explained in step 2. of physical testing in the
deploy.md file, then try again.
