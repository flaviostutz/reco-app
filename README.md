# recco
This is a mobile app that allows the user to record an audio/video while playing another audio/video in sync. Useful for musicians seeking to "play" together at distance.

The main problem this App solves is to playback and record a video at the same time with sub frame synchronism so that musicians can use it to record the various tracks of a music, for example.

## Development Tips

### Development machine preparation (based on MacOS)

* Install XCode

* Install Android Studio and configure it
  * Open https://reactnative.dev/docs/environment-setup
  * Click on "React Native CLI Quickstart"
  * Click "Android"
  * Follow installation and configuration instructions. There are lots of manual steps.
  * On MacOS Cataline, place exports and paths to ~/.zprofile (https://stackoverflow.com/questions/56784894/macos-catalina-10-15beta-why-is-bash-profile-not-sourced-by-my-shell)

* Install React Native related tools
```
brew install node
brew install watchman
sudo gem install cocoapods
npm install -g react-native ios-deploy
```

* After cloning project from repo
```
cd Recco
npm install

cd ios
pod install
```

* Launch app on emulator on XCode for iOS
```
cd Recco
npx react-native run-ios
```

* Launch app on emulator on Android Studio
```
npx react-native run-android
```

### Prepare for mobile

* Prepare Icons and Splashscreen for Android and iOS (used this and worked)
  * https://medium.com/better-programming/react-native-add-app-icons-and-launch-screens-onto-ios-and-android-apps-3bfbc20b7d4c
  * https://medium.com/handlebar-labs/how-to-add-a-splash-screen-to-a-react-native-app-ios-and-android-30a3cec835ae

### Build/Run on iOS

* Open project on XCode

```
open ios/Recco.xcworkspace
```

* Configure certificate on XCode

  * Open project on XCode, then click on "Recco" on root folder -> Target "Recco" -> Tab  "Signing & Capabilities" and select a certificate in "Team" dropbox

* Run app on real iOS device

```
npx react-native run-ios --device "Flavios iPhone"
```

* Add the certificate used on previous step as trusted in your device

  * On iPhone, go to Settings -> Device Management -> Developer App -> Your certificate and click "Trust"

  * Now locate App icon and launch it normally

  * It will start connected to your web server for hotdeployment and debuging
  
* For some reason, on the first App run, it closes without notice. Seems like a timeout due to taking too long to download the whole js bundle (before configuring Splash Screen pod on the project this didn't happen). Simply re-run the npx command and it will work.

### Build/Run on Android

* Open Android Studio at /android

  * Select menu Build -> Make Project and check if everything is right

* Run Recco on Android device

  * Connect Android device to your notebook's USB port

  * Follow https://developer.android.com/training/basics/firstapp/running-app to enable "USB Debugging" on device
    * If checkbox is disabled (greyed), unplug USB cable from computer, close Settings and try again
    * Connect USB cable after enabling USB Debugging and authorize this your computer on mobile device

  * On Android Studio, find your device on the center top of the screen and select it and save project

  * Run "npx react-native run-android"

  * Optional: After starting Metro Server you can run/debug the app directly from Android Studio


```
npx react-native run-android
```

* Reference: https://reactnative.dev/docs/running-on-device


### Implementation tips

* After adding a new react native lib, close any emulators or delete the App from the device, close web server and then run everything again. The bundle will be redownloaded from scratch.

* Track removal will perform some fancy time offset reference change recalculations. Be carefull there.

* Be careful about too many React Native renderings so that it won't affect the quality of time measurements

### Tests

* This is an overlay of two videos showing sync between playback and record. The larger numbers is from a Internet video which shows a framecounter. This video was played on Recco while it recorded the video below, taken with a mirror on front of the camera (it is a scissor actually ;). The measurements of actual recording and playback lags of the real device were done automatically.

<img src="recco-sync-test.gif"></img>

* In general, playback takes 200ms to actually start and record takes 800ms to begin after commanded. The app makes these measurements automatically because this varies from device to device.

### Play Store publishing

* Get the upload sign keystore with a former developer. If it was lost, you have to call for assistance on Playstore console for creating a new one.

* Configure your environment variables to point to the real upload certificate path/configurations
  * Example for MacOS

```
vi ~/.zprofile
export RECCO_UPLOAD_STORE_FILE=~/recco-upload.keystore
export RECCO_UPLOAD_STORE_PASSWORD=usedkeyhere
export RECCO_UPLOAD_KEY_ALIAS=recco-upload
export RECCO_UPLOAD_KEY_PASSWORD=usedkeyhere
```

* Note: The key ENV variables used during APK signing are located at android/gradle.properties

* Build signed distribution package

  * Reference: https://reactnative.dev/docs/signed-apk-android.html

```
cd android
./gradlew bundleRelease
```

* Go to GooglePlay Console -> App Releases -> Select Open Track -> upload and publish the package

  * The signed package can be found at "[workspace]/Recco/android/app/build/outputs/bundle/release/app-release.aab"

### Apple and Play Store descriptions

* short: Record an audio/video while playing another audio/video in sync and create mixes

* full: Recording while listening to another audio in sync can be easily done with Recco. Import media from your own media, create new recordings while listening/viewing the imported media and then save your work back to camera roll.

Very useful for musicians seeking to "play" together at distance without the burden of manual syncing and editing of video/audio tracks. 

Recco was created by musicians seeking the feeling of a "live rehearsal" at distance with other people so that it would be easy to give and get feedback from others.
