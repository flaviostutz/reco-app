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
import CameraRollPicker from 'react-native-camera-roll-picker';

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
    state: 'idle',

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
    lastRecordingStartTime: null,

    videoPicker: false,
    playbackVideo: require('./res/test-30fps-360p.mp4'),
    saveToCameraRoll: true,

    lagCounter: 0,
    lagTotal: 0,
  };  


// const App: () => React$Node = () => {
  render() {

    return (
      <>
        <StatusBar barStyle="dark-content" />
        {this.state.videoPicker &&
        <CameraRollPicker callback={this.onVideoSelected} 
                          assetType="Videos"
                          selectSingleItem={true} />
        }
        {!this.state.videoPicker &&
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Recco</Text>
                {/* <Text style={styles.sectionDescription}>
                  As soon as you click on a video it will start playing and a new recording will
                  take place
                </Text> */}
              </View>
              <View style={styles.sectionContainer}>
                <TouchableOpacity onPress={() => {this.toggleRecording()}}>
                  <RNCamera
                    ref={ref => {
                      this.camera = ref;
                    }}
                    style={styles.camera}

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
                </TouchableOpacity>
              </View>
              <View style={styles.sectionContainer}>
                <TouchableOpacity onPress={() => {this.selectVideo()}}>
                  <Video source={this.state.playbackVideo}   // Can be a URL or a local file.
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
                      pictureInPicture={true}
                      volume={1.0} />
                </TouchableOpacity>
              </View>
              {this.state.lastRecording != null && 
              <TouchableOpacity onPress={() => {this.togglePlayRecorded()}}>
                <View style={styles.sectionContainer}>
                  <Video source={{uri: this.state.lastRecording.uri}}   // Can be a URL or a local file.
                        ref={(ref) => {
                          this.player2 = ref
                        }}                                      // Store reference
                        paused={this.state.paused}
                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                        onError={this.videoError}               // Callback when video cannot be loaded
                        style={styles.video2} />
                </View>
              </TouchableOpacity>
              }
            </View>
          </ScrollView>
        </SafeAreaView>
        }
      </>
    );
  }

  onVideoSelected = async (images, current) => {
    console.log("VIDEO URI: " + current.uri)
    const ext='mp4'
    const appleId = current.uri.substring(5, 41);
    const uri = `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;
    this.setState({videoPicker: false, playbackVideo: {uri: uri}})
  }

  selectVideo = async () => {

    this.setState({videoPicker: true})
  }

  toggleRecording = async () => {
    if (this.state.state != 'idle') {
      this.stopRecording()
    } else {
      this.startRecording()
    }
  }
  
  startRecording = async () => {
    if (this.camera && this.state.state=='idle') {
      this.setState({state:'preparing', lastRecording: null}, async () => {
        console.log("START RECORDING")

        const options = {
          quality: '480p',
          maxDuration: 300,
          maxFileSize: 200 * 1024 * 1024
        };

        var startVideoDelay = 500
        if(this.state.lagCounter>0) {
          startVideoDelay = (this.state.lagTotal / this.state.lagCounter) + 500
        }

        console.log(new Date().getTime() + ' starting recording')
        this.camera.recordAsync(options).then((result) => {
          console.log(new Date().getTime() + " finished recording")
          this.stopVideo()

          // Alert.alert("Video recorded!", JSON.stringify(result));
          this.setState({lastRecording: result})
    
          if(this.state.saveToCameraRoll) {
            CameraRoll.saveToCameraRoll(result.uri, "video").then(() => {
              console.log("Video saved to camera roll successfuly");
            }).catch((err) => {
              console.warn("Failed to store recorded video: " + err.message);
            });
          }

        }).catch((err) => {
          console.warn("Video recording error. err=" + err);
        })

        console.log("Playback delay: " + startVideoDelay + "ms")

        setTimeout(()=>{
          this.startVideo()
        }, startVideoDelay);
      
      });
    }
  }

  stopRecording = () => {
    console.log("STOP RECORDING")
    if(this.camera && this.state.state=='recording'){
      this.camera.stopRecording();
    }
  }

  startVideo = (e) => {
    this.setState({paused: false}, async () => {
      console.log(new Date().getTime() + " startVideo")
    })
  }

  stopVideo = (e) => {
    this.setState({paused: true}, async () => {
      console.log(new Date().getTime() + " stopVideo")
      this.player1.seek(0)
      if(this.player2) {
        this.player2.seek(0)
      }
    })
  }

  togglePlayRecorded = async () => {
    if (!this.state.paused) {
      this.stopVideo()
    } else {
      this.startVideo()
    }
  }




  onAudioInterrupted = (e) => {
    console.log(new Date().getTime() + ' onAudioInterrupted')
  }

  onAudioConnected = (e) => {
    console.log(new Date().getTime() + ' onAudioConnected')
  }

  onRecordingStart = (e) => {
    this.state.state = 'recording'
    this.state.lastRecordingActualStartTime = new Date().getTime(),
    // this.state.recordingTriggerTime = (this.state.lastRecordingActualTime - this.state.lastRecordingTime)
    console.log(new Date().getTime() + ' onRecordingStart')
    // console.log('onRecordingStart: trigger time: ' + this.state.recordingTriggerTime + 'ms')
    // this.startVideo()
  }

  onRecordingEnd = (e) => {
    console.log(new Date().getTime() + ' onRecordingEnd')
    this.state.state = 'idle'
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
    var playerElapsed = e.currentTime * 1000

    if(this.state.state=='recording') {
      var recorderElapsed = (new Date().getTime() - this.state.lastRecordingActualStartTime)
      if(this.state.lagCounter<10) {
        console.log(new Date().getTime() + ' onProgress measure lag - ' + (playerElapsed - recorderElapsed) + "ms")
        this.state.lagCounter++
        this.state.lagTotal += (playerElapsed - recorderElapsed)
      }
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
  camera: {
    paddingTop: 10,
    height: 250,
  },
  video1: {
    paddingTop: 10,
    height: 250,
  },
  video2: {
    paddingTop: 10,
    height: 250,
  },
});

export default App;
