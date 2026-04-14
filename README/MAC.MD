# Expo Setup Guide (macOS)

This guide will help you set up and run the project locally on macOS.

## 1. Install Node.js and npm
This project uses **npm**.

You can install Node.js (which includes npm) in one of the following ways:

- Download it from the official website: https://nodejs.org/en/
- Make sure to install the **LTS version**

Alternatively via terminal:

```bash
npm install node
```

## 2. Clone the repository
Clone Login gitlab repository named “Login App”

## 3. Install ruby
Check your current Ruby version:

```bash
ruby -v
```

If your version is 3.0.0 or later, you can skip this step.

If not, install Ruby:
```bash
npm install ruby
```

## 4. install dependencies 
Install all project dependencies:
```bash
npm install
```

## 5. Run Expo prebuild

Generate the native iOS and Android project files:
```bash
npx expo prebuild
```

## 6. Starting expo

When starting development for the first time, the setup process differs depending on whether you are targeting **Android** or **iOS**.

## iOS simulation
> **Note:** To use the iOS simulator, you must have Xcode installed from the App Store.

The first time you set up the iOS simulator, you need to open the Xcode workspace file correctly: nucleus/ios/Login.xcworkspace

Open it in Xcode and run the desired build to ensure all dependencies and configurations are loaded correctly.
After this initial setup, you can use any code editor you prefer and continue development by:

```bash
npx expo start
```

## Android Emulator Setup

> **Note:** To run an Android emulator, you need to install Android Studio:  
https://developer.android.com/studio

---

### 1. Install Android Studio & Create a Virtual Device:

Open Android Studio and set up a virtual device:

- Go to **Device Manager**
- Click **Create Viritual Device**
- Select a device (e.g. Pixel series)
- Download the required system image via the SDK Manager
- Start the emulator

---

### 2. Install Java (JDK 17):

Install Java JDK 17 using Homebrew:

```bash
brew install --cask zulu@17
```
### 3. Configure Environment Variables

Before running Android in Expo, you most likely need to set your SDK and Java paths.
Open your shell configuration file:
```bash
nano ~/.zshrc
```

Add the following (replace ```*PASTEYOURNAMEHERE*``` with your actual username, or use ```$HOME``` instead of the full path before Library):

```bash
export ANDROID_HOME=/Users/*PASTEYOURNAMEHERE*/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```
Then apply the changes:

```bash
source ~/.zshrc
```
### 4. Run Android with Expo
Build and install the app on the emulator:
```bash
npx expo run:android
```

### 5. Start Development Server

After setup, you can use any code editor and start the Metro bundler:

```bash
npx expo start
```