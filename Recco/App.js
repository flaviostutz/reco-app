/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

'use strict'

import React, {
  Component
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { Spinner } from 'native-base';

import { RNCamera } from 'react-native-camera';

import Video from 'react-native-video';

class App extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    paused: true,
    recording: false,

    flash: RNCamera.Constants.FlashMode.off,
    type: RNCamera.Constants.Type.front,
    ratio: '16:9',

    recordOptions: {
      maxDuration: 5,
      quality: RNCamera.Constants.VideoQuality['720p'],
      codec: RNCamera.Constants.VideoCodec['H264'],
      orientation: 'portrait',
      mirrorVideo: true,
      path: '/test/test.mp4'
    },
  };  


// const App: () => React$Node = () => {
  render() {

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <Header />
            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Click on video to start</Text>
                <Text style={styles.sectionDescription}>
                  As soon as you click on a video it will start playing and a new recording will
                  take place
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <RNCamera
                  ref={ref => {
                    this.camera = ref;
                  }}
                  style={{
                    flex: 1,
                    justifyContent: 'space-between',
                  }}

                  //camera recording config
                  type={this.state.type}
                  ratio={this.state.ratio}
                  flashMode={this.state.flash}

                  //events
                  onAudioInterrupted={this.onAudioInterrupted}
                  onAudioConnected={this.onAudioConnected}
                  onRecordingStart={this.onRecordingStart}
                  onRecordingEnd={this.onRecordingEnd}
                  onCameraReady={this.onCameraReady}
                  onMountError={this.onCameraMountError}

                  //camera authorization matters
                  onStatusChange={this.onCameraStatusChange}
                  androidCameraPermissionOptions={{
                    title: 'Permission to record camera video',
                    message: 'We need access to your camera in order to record your track',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                  }}
                  androidRecordAudioPermissionOptions={{
                    title: 'Permission to record audio',
                    message: 'We need access to your microphone in order to record your track',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                  }}
                  pendingAuthorizationView={
                    <SafeAreaView style={styles.cameraLoading}>
                      <Spinner color={Colors.gray}/>
                    </SafeAreaView>
                  }
                  notAuthorizedView={
                    <View>
                      Recco was not authorized to access media
                    </View>
                  }
                >
                </RNCamera>
              </View>
              <View style={styles.sectionContainer}>
                {/* <TouchableOpacity onPress={() => {this.setState({paused: !this.state.paused})}}> */}
                <TouchableOpacity onPress={() => {this.toggleVideo()}}>
                  <Video source={require('./res/test-30fps-360p.mp4')}   // Can be a URL or a local file.
                      ref={(ref) => {
                        this.player1 = ref
                      }}                                      // Store reference
                      paused={this.state.paused}
                      onBuffer={this.onBuffer}                // Callback when remote video is buffering
                      onError={this.videoError}               // Callback when video cannot be loaded
                      style={styles.video1} />
                </TouchableOpacity>
              </View>
              <View style={styles.sectionContainer}>
                <Video source={require('./res/test-30fps-360p.mp4')}   // Can be a URL or a local file.
                        ref={(ref) => {
                          this.player2 = ref
                        }}                                      // Store reference
                        paused={this.state.paused}
                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                        onError={this.videoError}               // Callback when video cannot be loaded
                        style={styles.video1} />
              </View>
              <View style={styles.sectionContainer}>
                <Video source={{uri: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"}}   // Can be a URL or a local file.
                      ref={(ref) => {
                        this.player3 = ref
                      }}                                      // Store reference
                      paused={this.state.paused}
                      onBuffer={this.onBuffer}                // Callback when remote video is buffering
                      onError={this.videoError}               // Callback when video cannot be loaded
                      style={styles.video1} />
                <Text style={styles.sectionDescription}>HERE</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  toggleVideo = async () => {
    if (this.state.recording) {
      this.stopVideo()
    } else {
      this.startVideo()
    }
  }
  
  startVideo = async () => {
    if (this.camera && !this.state.recording) {
      console.warn("START RECORDING!")

      // need to do this in order to avoid race conditions
      this.state.recording = true;

      const options = {
        quality: '480p',
        maxDuration: 5,
        maxFileSize: 100 * 1024 * 1024
       };


      this.setState({recording: true, elapsed: -1}, async () => {

        let result = null;
        try {
          console.warn("BEGIN RECORD NOW")
          result = await this.camera.recordAsync(options);
          //camera.stopRecording
          console.warn("FINISHED RECORD NOW")
        }
        catch(err){
          console.warn("VIDEO RECORD FAIL", err.message, err);
          Alert.alert("Error", "Failed to store recorded video: " + err.message);
        }


        if(result){
          Alert.alert("Video recorded!", JSON.stringify(result));
        }

        // give time for the camera to recover
        setTimeout(()=>{
          this.setState({recording: false});
        }, 500);

        // might be cleared on recording stop or
        // here if we had errors
        if(this._recordingTimer){
          clearInterval(this._recordingTimer);
          this._recordingTimer = null;
        }

      });

    }
  }

  stopVideo = () => {
    console.warn("STOP RECORDING!")
    if(this.camera && this.state.recording){
      this.camera.stopRecording();
    }
  }

};


const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  video1: {
    paddingTop: 10,
    height: 200,
  },
});

export default App;
