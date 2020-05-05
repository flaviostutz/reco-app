'use strict'

import React, {
    Component
} from 'react';

import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

import Slider from '@react-native-community/slider'

import { attachModelToView } from 'rhelena';

import CameraRollSelector from "react-native-camera-roll-selector";
import { Icon, Overlay, Button } from 'react-native-elements'
import { Spinner } from 'native-base';
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video';

import CameraModel from './CameraModel'

import FlashMessage from "react-native-flash-message";

export default class CameraView extends Component {

    constructor(props) {
        super(props);
        attachModelToView(new CameraModel(props), this);
    }

    UNSAFE_componentDidMount = () => {
        attachModelToView(new CameraModel(this.props), this);
    }

    render() {

        console.log('RENDER()')

        if(this.viewModel==null) {
            return <View style={{backgroundColor:'black', flex:1}}></View>
        }

        return (
            <>

                {/* CAMERA ROLL PICKER */}
                {this.viewModel.showVideoPicker &&
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <View style={{ height: 70, flexDirection: 'row' }}>
                            <Icon
                                name={'chevron-left'}
                                type='entypo'
                                color='black'
                                size={54}
                                style={{ padding: 8, width: 80 }}
                                onPress={() => { this.viewModel.showVideoPicker = false }} />
                            <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
                                <Text style={{ textAlign: 'right', fontSize: 20, fontWeight: 'bold' }}>Select a video</Text>
                            </View>
                        </View>
                        <CameraRollSelector callback={this.viewModel.onVideoSelected}
                            assetType="Videos"
                            selectSingleItem={true} />
                    </View>
                }

                {/* TRACK PROPERTIES POPUP */}
                {this.viewModel.selectedTrack != null &&
                    <Overlay isVisible={this.viewModel.selectedTrack != null} onBackdropPress={() => this.viewModel.selectedTrack = null}
                        overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    >
                        <View style={{ padding: 5 }}>
                            <View>
                                <Button
                                    icon={
                                        <Icon
                                            name={'share-square'}
                                            type='font-awesome-5'
                                            color='white'
                                            size={20}
                                            style={{ padding: 5 }}
                                        />
                                    }
                                    containerStyle={{ padding: 0 }}
                                    disabled={!this.viewModel.selectedTrack.track.source.uri.startsWith("file://")}
                                    onPress={() => this.viewModel.shareTrack(this.viewModel.selectedTrack)}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <Button
                                    icon={
                                        <Icon
                                            name={'chevron-down'}
                                            type='font-awesome'
                                            color='white'
                                            size={24}
                                            style={{ padding: 10 }}
                                        />
                                    }
                                    onPress={() => this.viewModel.moveSelectedTrack(1)}
                                    disabled={this.viewModel.state != 'idle' || this.viewModel.selectedTrack.track.order == (this.viewModel.tracks.length - 1)}
                                />
                                <Button
                                    icon={
                                        <Icon
                                            name={'chevron-up'}
                                            type='font-awesome'
                                            color='white'
                                            size={24}
                                            style={{ padding: 10 }}
                                        />
                                    }
                                    onPress={() => this.viewModel.moveSelectedTrack(-1)}
                                    disabled={this.viewModel.state != 'idle' || this.viewModel.selectedTrack.track.order == 0}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                <Button
                                    icon={
                                        <Icon
                                            name={'backward'}
                                            type='font-awesome'
                                            color='white'
                                            size={24}
                                            style={{ padding: 10 }}
                                        />
                                    }
                                    onPress={() => {this.viewModel.selectedTrack.track.referenceTimeOffset=this.viewModel.selectedTrack.track.referenceTimeOffset-1; this.forceUpdate()}}
                                    disabled={this.viewModel.state != 'idle' || this.viewModel.selectedTrack.track.referenceTimeOffset==null}
                                />
                                <Text style={{color:'white', fontSize:18}}>{Math.round(this.viewModel.selectedTrack.track.referenceTimeOffset)}ms</Text>
                                <Button
                                    icon={
                                        <Icon
                                            name={'forward'}
                                            type='font-awesome'
                                            color='white'
                                            size={24}
                                            style={{ padding: 10 }}
                                        />
                                    }
                                    onPress={() => {this.viewModel.selectedTrack.track.referenceTimeOffset=this.viewModel.selectedTrack.track.referenceTimeOffset+1;this.forceUpdate()}}
                                    disabled={this.viewModel.state != 'idle' || this.viewModel.selectedTrack.track.referenceTimeOffset==null}
                                />
                            </View>
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center', color: 'white' }}>Volume</Text>
                                <Slider
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={this.viewModel.selectedTrack.track.volume}
                                    onSlidingComplete={(v) => { this.viewModel.selectedTrack.track.volume = v; this.viewModel.selectedTrack = this.viewModel.selectedTrack }}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <Button
                                    icon={
                                        <Icon
                                            name={this.viewModel.selectedTrack.track.audioMute ? 'volume-variant-off' : 'volume-low'}
                                            type='material-community'
                                            color='black'
                                            size={32}
                                            style={{ padding: 7 }}
                                        />
                                    }
                                    containerStyle={{ padding: 20 }}
                                    buttonStyle={{ backgroundColor: this.viewModel.selectedTrack.track.audioMute ? '#666666' : '#4387D6' }}
                                    onPress={() => { this.viewModel.selectedTrack.track.audioMute = !this.viewModel.selectedTrack.track.audioMute; this.viewModel.selectedTrack = this.viewModel.selectedTrack }}
                                />
                                <Button
                                    icon={
                                        <Icon
                                            name={this.viewModel.selectedTrack.track.videoMute ? 'videocam-off' : 'videocam'}
                                            type='material'
                                            color='black'
                                            size={28}
                                            style={{ padding: 10 }}
                                        />
                                    }
                                    containerStyle={{ padding: 20 }}
                                    buttonStyle={{ backgroundColor: this.viewModel.selectedTrack.track.videoMute ? '#666666' : '#4387D6' }}
                                    onPress={() => { this.viewModel.selectedTrack.track.videoMute = !this.viewModel.selectedTrack.track.videoMute; this.viewModel.selectedTrack = this.viewModel.selectedTrack }}
                                />
                            </View>
                            <View>
                                <Button
                                    icon={
                                        <Icon
                                            name={'trash'}
                                            type='font-awesome'
                                            color='white'
                                            size={24}
                                            style={{ padding: 5 }}
                                        />
                                    }
                                    buttonStyle={{ backgroundColor: '#AA0000' }}
                                    containerStyle={{ padding: 0 }}
                                    onPress={() => this.viewModel.removeSelectedTrack()}
                                    disabled={this.viewModel.state != 'idle'}
                                />
                            </View>
                        </View>
                    </Overlay>
                }

                {/* CAMERA */}
                {!this.viewModel.showVideoPicker &&
                    <View style={{ flex: 1 }}>
                        <RNCamera
                            ref={ref => {
                                this.viewModel.camera.camera = ref;
                            }}
                            style={[styles.backgroundVideo, this.viewModel.borderRecording()]}

                            //camera recording config
                            type={this.viewModel.type}
                            ratio={this.viewModel.ratio}
                            flashMode={this.viewModel.flash}

                            //events
                            onAudioInterrupted={this.viewModel.onAudioInterrupted}
                            onRecordingStart={this.viewModel.onRecordingStart}
                            onRecordingEnd={this.viewModel.onRecordingEnd}
                            onMountError={this.viewModel.onCameraMountError}
                            // onAudioConnected={this.viewModel.onAudioConnected}
                            // onCameraReady={this.viewModel.onCameraReady}

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
                                <View style={styles.cameraLoading}>
                                    <Spinner color={'gray'} />
                                </View>
                            }
                            notAuthorizedView={
                                <View>
                                    <Text>Recco was not authorized to access the camera</Text>
                                </View>
                            }
                        />


                        {/* HEADER */}
                        <View style={{}}>
                            <View style={{ height: 70, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <View style={{ flex: 1, justifyContent: 'center', padding: 10 }}>
                                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'darkred' }}>Recco</Text>
                                </View>
                                {this.viewModel.state == 'idle' &&
                                    <Icon
                                        name={'ios-reverse-camera'}
                                        type='ionicon'
                                        color='black'
                                        size={34}
                                        style={{ padding: 6, width: 60 }}
                                        onPress={() => this.viewModel.toggleCamera} />
                                }
                                {this.viewModel.state == 'idle' &&
                                    <Icon
                                        name={'ios-menu'}
                                        type='ionicon'
                                        color='black'
                                        size={34}
                                        style={{ padding: 6, width: 60 }} />
                                }
                            </View>

                        </View>


                        {/* TRACKS LIST */}
                        <ScrollView
                            contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: "space-around", flexWrap: 'wrap', flex: 1 }}>

                                {this.viewModel.sortedTracks().map((t) => (
                                    <TouchableOpacity style={{ padding: 0, ...t.borderVideo() }}
                                        onPress={() => { this.viewModel.showTrackDialog(t) }}
                                        activeOpacity={0.6}>

                                        <View>
                                            {(t.track.audioMute) &&
                                                <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 99, padding: 20 }}>
                                                    <View style={{ backgroundColor: 'rgba(0,0,0,1)' }}>
                                                        <Icon
                                                            name={'volume-variant-off'}
                                                            type='material-community'
                                                            color='gray'
                                                            size={24}
                                                            style={{ padding: 5 }}
                                                        />
                                                    </View>
                                                </View>
                                            }
                                            {(t.track.videoMute) &&
                                                <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 88, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor:'gray' }}>
                                                    <View style={{ backgroundColor: 'rgba(0,0,0,1)' }}>
                                                        <Icon
                                                            name={'videocam-off'}
                                                            type='material'
                                                            color='gray'
                                                            size={60}
                                                            style={{ padding: 5 }}
                                                        />
                                                    </View>
                                                </View>
                                            }
                                        </View>

                                        <Video source={t.track.source}
                                            ref={(ref) => {
                                                t.player = ref
                                            }}
                                            style={t.videoStyle()}
                                            paused={this.viewModel.paused}
                                            muted={t.track.audioMute}
                                            onProgress={t.onProgress}
                                            onEnd={t.onEnd}
                                            onError={t.onError}
                                            muted={t.track.audioMute}
                                            // onLoad={this.onLoad}
                                            // onLoadStart={this.onLoadStart}
                                            // onBuffer={this.onBuffer}
                                            // onSeek={this.onSeek}
                                            // onReadyForDisplay={this.onReadyForDisplay}
                                            volume={t.track.volume} />
                                    </TouchableOpacity>
                                ))}

                            </View>
                        </ScrollView>




                        {/* FOOTER */}
                        <View style={styles.footer}>

                            {/* CAMERA ROLL CONTROL */}
                            <View style={styles.controlArea}>
                                {this.viewModel.showAddCameraRollControl() &&
                                    <TouchableOpacity onPress={() => { this.viewModel.addTrackFromCameraRoll() }}
                                        style={{ flex: 0.75 }}>
                                        <Video source={this.viewModel.cameraRollImage}
                                            paused={true} style={{ flex: 1 }}
                                        />
                                    </TouchableOpacity>
                                }
                                {/* TIME COUNTER */}
                                {!this.viewModel.showAddCameraRollControl() &&
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <Text style={{ textAlign: 'center', color: this.viewModel.timeColor(), fontSize: 20, fontWeight: 'bold' }}>01:23</Text>
                                    </View>
                                }
                            </View>

                            {/* RECORD CONTROL */}
                            <View style={styles.controlArea}>
                                {this.viewModel.showRecordControl() &&
                                    <TouchableOpacity onPress={() => { this.viewModel.toggleRecording() }}>
                                        <Icon
                                            name={this.viewModel.recordIcon()}
                                            type='entypo'
                                            color='#ee4400'
                                            size={74}
                                            style={{ padding: 8 }} />
                                    </TouchableOpacity>
                                }
                            </View>

                            {/* PLAY CONTROL */}
                            <View style={styles.controlArea}>
                                {this.viewModel.showPlayControl() &&
                                    <TouchableOpacity onPress={() => { this.viewModel.togglePlaying() }} style={styles.controlArea}>
                                        <Icon
                                            name={this.viewModel.playIcon()}
                                            type='entypo'
                                            color='#ee4400'
                                            size={58}
                                            style={{ padding: 8 }} />
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                }
                <FlashMessage position="top" />
            </>
        );
    }

};


//STYLES
const { height } = Dimensions.get("window");
const styles = StyleSheet.create({

    backgroundVideo: {
        height: height,
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: -99
    },
    overlayVideo: {
        zIndex: 10,
        margin: 10,
    },

    footer: {
        padding: 0,
        height: 110,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    controlArea: {
        flex: 1,
        justifyContent: 'center'
    },

});
