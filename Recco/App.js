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
  Image,
  StatusBar,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import CameraRoll from "@react-native-community/cameraroll";
import CameraRollSelector from "react-native-camera-roll-selector";

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

    recordingStartTime: null,
    videoLag: null,

    videoPicker: false,
    saveToCameraRoll: true,

    volume1: 0.5,
    volume2: 1.0,

    firstProgress: true,

    cameraRollImage: null,
  };

  render() {

    if(this.state.cameraRollImage==null) {
      var options = {
        first: 1,
        assetType: "Videos"
      }
      CameraRoll.getPhotos(options).then((photos) => {
        if(photos.edges.length>0) {
          console.log('video preview found ' + JSON.stringify(photos))
          this.setState({cameraRollImage: {uri: this.phToAssetsUri(photos.edges[0].node.image.uri)}})
        } else {
          this.setState({cameraRollImage: require('./res/test-30fps-360p.mp4')})
        }
      }).catch((err) => {
        console.warn('Error getting photo: ' + err)
      })
    }

    return (
      <>
        {this.state.videoPicker &&
        <CameraRollSelector callback={this.onVideoSelected} 
                          assetType="Videos"
                          selectSingleItem={true} />
        }

        {!this.state.videoPicker &&
        <View style={{flex:1}}>
          {/* <TouchableOpacity onPress={() => {this.toggleRecording()}}  */}
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={[styles.backgroundVideo, this.borderRecording()]}

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

          <View style={styles.header}>
            <Text style={styles.title}>Recco</Text>
          </View>

          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View>
              <View style={styles.scrollRegion}>
                <TouchableOpacity onPress={() => {this.selectVideo()}}
                  style={[styles.overlayVideo, this.borderVideo()]}>
                  <Video source={this.state.playbackVideo}   // Can be a URL or a local file.
                      ref={(ref) => {
                        this.player1 = ref
                      }}                                      // Store reference
                      style={{flex:1}}
                      paused={this.state.paused}
                      onBuffer={this.onBuffer}                // Callback when remote video is buffering
                      onError={this.videoError}               // Callback when video cannot be loaded
                      onLoad={this.onLoad}
                      onLoadStart={this.onLoadStart}
                      onProgress={this.onProgress}
                      onSeek={this.onSeek1}
                      onReadyForDisplay={this.onReadyForDisplay}
                      bufferConfig={{}}
                      playWhenInactive={true}
                      playInBackground={true}
                      pictureInPicture={false}
                      volume={this.state.volume1} />
                </TouchableOpacity>
              </View>

              {this.state.lastRecording != null && 
              <TouchableOpacity onPress={() => {this.togglePlayRecorded()}}
                style={[styles.overlayVideo, this.borderVideo()]}>
                <Video source={{uri: this.state.lastRecording.uri}}   // Can be a URL or a local file.
                      ref={(ref) => {
                        this.player2 = ref
                      }}
                      style={{flex:1}}
                      paused={this.state.paused}
                      onError={this.onVideoError}               // Callback when video cannot be loaded
                      onSeek={this.onSeek2}
                      volume={this.state.volume2} />
              </TouchableOpacity>
              }
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={{flexDirection:'row-reverse'}}>
              <Video source={this.state.cameraRollImage} 
                paused={true}
                style={styles.rollThumb} />
              <Text style={styles.plusSign}>+</Text>
            </View>
            <Text>aaaadsfaf adfasdfasfd</Text>
            <Text style={styles.rollThumb} />
          </View>
        </View>
        }
      </>
    );
  }

  borderRecording = () => {
    if(this.state.state == 'recording') {
      return {
        borderColor: "#FF0000",
        borderRadius: 6,
        borderWidth: 4,
      }
    }
    return {}
  }

  borderVideo = () => {
    if(this.state.state == 'idle') {
      return {
      }
    }
    if(this.state.state == 'recording' || this.state.state == 'playing') {
      return {
        borderColor: "#00FF00",
        borderRadius: 6,
        borderWidth: 2,
      }
    }
    if(this.state.state == 'preparing') {
      return {
        borderColor: "yellow",
        borderRadius: 6,
        borderWidth: 2,
      }
    }
    return {}
  }

  phToAssetsUri(phUri) {
    const ext='mp4'
    const appleId = phUri.substring(5, 41);
    return `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;
  }

  onVideoSelected = async (images, current) => {
    console.log("VIDEO URI: " + current.uri)
    this.setState({videoPicker: false, playbackVideo: {uri: phToAssetsUri(current.uri)}})
  }

  selectVideo = async () => {
    this.stopRecording()
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

        console.log(new Date().getTime() + ' starting recording')
    
        // this.state.recordCommandTime = new Date().getTime()
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

      });
    }
  }

  stopRecording = () => {
    console.log("STOP RECORDING")
    if(this.camera && this.state.state=='recording'){
      this.camera.stopRecording();
      this.stopVideo()
    }
  }

  startVideo = (e) => {
    console.log(new Date().getTime() + " startVideo")
    this.state.firstProgress = true

    //sync recording
    this.player1.seek(0)
    if(this.player2!=null) {
      this.player2.seek(this.state.videoLag/1000.0, 0)
    }

    setTimeout(()=>{
      this.setState({paused: false})
    }, 1000);
  }

  stopVideo = (e) => {
    console.log(new Date().getTime() + " stopVideo")
    // this.player1.seek(0)
    // if(this.player2) {
    //   this.player2.seek(0)
    // }
    this.state.state = 'idle'
    this.setState({paused: true})
  }

  togglePlayRecorded = async () => {
    if (!this.state.paused) {
      this.stopVideo()
    } else {
      this.state.state = 'playing'
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
    console.log(new Date().getTime() + ' onRecordingStart')
    this.state.recordingStartTime = new Date().getTime()
    this.state.videoLag = Number.MAX_VALUE
    this.startVideo()
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



  onBuffer = (e) => {
    console.log(new Date().getTime() + ' onBuffer')
  }
  onVideoError = (e) => {
    console.log(new Date().getTime() + ' onVideoError')
  }
  onLoad = (e) => {
    console.log(new Date().getTime() + ' onLoad')
  }
  onLoadStart = (e) => {
    console.log(new Date().getTime() + ' onLoadStart')
  }
  onSeek1 = (e) => {
    console.log(new Date().getTime() + ' onSeek1 ')
    console.log(e)
  }
  onSeek2 = (e) => {
    console.log(new Date().getTime() + ' onSeek2 ')
    console.log(e)
  }
  onProgress = (e) => {
    console.log(new Date().getTime() + ' onProgress')
    var playerElapsed = e.currentTime * 1000

    if(this.state.state=='recording') {
      //this info has very low time skew too
      var recorderElapsed = (new Date().getTime() - this.state.recordingStartTime)

      //this skew was added experimentally for better sounding on my iPhone
      //must be evaluated on various devices
      var customLagSkew = 5
      var lag = recorderElapsed - playerElapsed - customLagSkew
      console.log("lag=" + lag)

      //use min value because it will probably represent the sample with 
      //less latency from notification queue
      if(lag > 100 && lag < this.state.videoLag) {
        this.state.videoLag = lag
      }

      // if(this.state.firstProgress) {
      this.state.firstProgress = false
      console.log("recordingStartTime: " + this.state.recordingStartTime)
      console.log("videoStartTime:     " + (this.state.recordingStartTime + this.state.videoLag))
      console.log("player lag: " + (this.state.videoLag) + "ms")
      // }
    }
  }
  onReadyForDisplay = (e) => {
    console.log(new Date().getTime() + ' onReadyForDisplay')
  }

};

class Track {
  constructor(uri, guideLag, volume, audioMute, videoMute, order) {
    this.uri = uri
    this.guideLag = guideLag
    this.volume = volume
    this.audioMute = audioMute
    this.videoMute = videoMute
    this.order = order
  }
}

const { height } = Dimensions.get("window");
const styles = StyleSheet.create({

  header: {
    padding: 4,
    height: 60,
    borderWidth: 2
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'darkred',
    height: 200,
    top: 18
  },

  backgroundVideo: {
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
    // justifyContent: "space-between",
    // alignItems: "stretch",
    bottom: 0,
    right: 0,
    zIndex: -99
  },
  scrollRegion: {
    justifyContent: "space-between"
  },
  overlayVideo: {
    width: 200,
    height: 200,
    zIndex: 10,
    margin: 10,
  },

  footer: {
    padding: 14,
    height: 84,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rollThumb: {
    width: 50,
    height: 50,
    borderWidth: 2
  },
  plusSign: {
    fontSize:25, 
    fontWeight:'600', 
    color:'white', 
    position:'absolute'
  }

});

export default App;
