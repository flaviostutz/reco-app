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
  Alert,
  TouchableOpacity,
} from 'react-native';

import CameraRoll from "@react-native-community/cameraroll";

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
      mirrorVideo: false,
      path: '/test/test.mp4'
    },

    lastRecording: null,

    lastRecordingTime: null,
    lastRecordingActualTime: null,

    // recordingTriggerTime: 800,

    lagCounter: 0,
    lagTotal: 0,

    isRecording: false,
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
            {/* <Header /> */}
            {/* {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )} */}
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
                  style={styles.video1}

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
                <TouchableOpacity onPress={() => {this.toggleRecording()}}>
                  <Video source={require('./res/test-30fps-360p.mp4')}   // Can be a URL or a local file.
                      ref={(ref) => {
                        this.player1 = ref
                      }}                                      // Store reference
                      paused={this.state.paused}
                      onBuffer={this.onBuffer}                // Callback when remote video is buffering
                      onError={this.videoError}               // Callback when video cannot be loaded
                      onLoad={this.onLoad}
                      onLoadStart={this.onLoadStart}
                      onProgress={this.onProgress}
                      onReadyForDisplay={this.onReadyForDisplay}
                      bufferConfig={{}}
                      style={styles.video1}
                      playWhenInactive={true}
                      playInBackground={true}
                      volume={1.0} />
                </TouchableOpacity>
              </View>
              {this.state.lastRecording != null && 
              <TouchableOpacity onPress={() => {this.togglePlayRecorded()}}>
                <View style={styles.sectionContainer}>
                  <Video source={{uri: this.state.lastRecording.uri}}   // Can be a URL or a local file.
                        ref={(ref) => {
                          this.player3 = ref
                        }}                                      // Store reference
                        paused={this.state.paused}
                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                        onError={this.videoError}               // Callback when video cannot be loaded
                        style={styles.video3} />
                </View>
              </TouchableOpacity>
              }
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  toggleRecording = async () => {
    if (this.state.recording) {
      this.stopRecording()
    } else {
      this.startRecording()
    }
  }
  
  startRecording = async () => {
    if (this.camera && !this.state.recording) {
      this.setState({lastRecording: null})
      console.log("START RECORDING!")

      // need to do this in order to avoid race conditions
      this.state.recording = true;

      const options = {
        quality: '480p',
        maxDuration: 5,
        maxFileSize: 100 * 1024 * 1024
       };


      this.setState({recording: true, elapsed: -1}, async () => {

        let result = null;
        console.log("BEGIN RECORD NOW " + new Date().getTime())
        // setTimeout(()=>{
        //   this.startVideo()
        // }, 5);
        this.state.lastRecordingTime = new Date()

        // var startVideoDelay = this.state.recordingTriggerTime - 200
        var startVideoDelay = 500
        if(this.state.lagCounter>0) {
          startVideoDelay = (this.state.lagTotal / this.state.lagCounter) + 500
        }
        console.log("USING DELAY " + startVideoDelay + "ms")

        console.log(new Date().getTime() + ' launch camera recording')
        this.camera.recordAsync(options).then((result) => {
          //camera.stopRecording
          console.log("FINISHED RECORD NOW " + new Date().getTime())

          if(result) {
            Alert.alert("Video recorded!", JSON.stringify(result));
            this.stopVideo()
            this.setState({lastRecording: result})
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
  
          CameraRoll.saveToCameraRoll(result.uri, "video");
        }, () => {
          console.log("VIDEO RECORD FAIL", err.message, err);
          Alert.alert("Error", "Failed to store recorded video: " + err.message);
        })

        console.log(new Date().getTime() + ' launch video playback')

        setTimeout(()=>{
          this.startVideo()
        }, startVideoDelay);
      
      });
    }
  }

  stopRecording = () => {
    console.log("STOP RECORDING!")
    if(this.camera && this.state.recording){
      this.camera.stopRecording();
    }
  }

  startVideo = (e) => {
    var start = new Date().getTime()
    this.setState({paused: false}, async () => {
      console.log(new Date().getTime() + " startVideo")
      console.log("setState took " + (new Date().getTime() - start) + "ms")
    })
    // console.log(this.player1)
    // this.player1.resume()
  }

  stopVideo = (e) => {
    this.setState({paused: true})   
    this.player1.seek(0)
  }

  playRecorded = (e) => {
    this.player1.seek(0)
    this.player3.seek(0)
    setTimeout(()=>{
      this.startVideo()
    }, 500);
  }

  togglePlayRecorded = async () => {
    if (!this.state.paused) {
      this.setState({paused: true})
    } else {
      this.playRecorded()
    }
  }




  onAudioInterrupted = (e) => {
    console.log(new Date().getTime() + ' onAudioInterrupted')
  }

  onAudioConnected = (e) => {
    console.log(new Date().getTime() + ' onAudioConnected')
  }

  onRecordingStart = (e) => {
    this.state.isRecording = true
    this.state.lastRecordingActualTime = new Date().getTime(),
    // this.state.recordingTriggerTime = (this.state.lastRecordingActualTime - this.state.lastRecordingTime)
    console.log(new Date().getTime() + ' onRecordingStart')
    // console.log('onRecordingStart: trigger time: ' + this.state.recordingTriggerTime + 'ms')
    // this.startVideo()
  }

  onRecordingEnd = (e) => {
    console.log(new Date().getTime() + ' onRecordingEnd')
    this.state.isRecording = false
  }

  onCameraReady = (e) => {
    console.log(new Date().getTime() + ' onCameraReady')
  }
  
  onMountError = (e) => {
    console.log(new Date().getTime() + ' onMountError')
  }



  onLoad = (e) => {
    console.log(new Date().getTime() + ' onLoad')
  }
  onLoadStart = (e) => {
    console.log(new Date().getTime() + ' onLoadStart')
  }
  onProgress = (e) => {
    console.log(new Date().getTime() + ' onProgress')
    var playerElapsed = e.currentTime * 1000

    if(this.state.isRecording) {
      var recorderElapsed = (new Date().getTime() - this.state.lastRecordingActualTime)
      if(this.state.lagCounter<5) {
        this.state.lagCounter++
        this.state.lagTotal += (playerElapsed - recorderElapsed)
      }
      // console.log("PLAYER   ELAPSED " + playerElapsed + "ms")
      // console.log("RECORDER ELAPSED " + recorderElapsed + "ms")
      // console.log("LAG ADJUST=" + this.state.lastLag)
      console.log("CURRENT LAG=" + playerElapsed - recorderElapsed)
    }
  }
  onReadyForDisplay = (e) => {
    console.log(new Date().getTime() + ' onReadyForDisplay')
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
    height: 150,
  },
  video3: {
    paddingTop: 10,
    height: 300,
  },
});

export default App;
