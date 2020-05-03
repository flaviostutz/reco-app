import { RhelenaPresentationModel } from 'rhelena';
import CameraRoll from "@react-native-community/cameraroll";
import { RNCamera } from 'react-native-camera';

import Track from '../domain/Track'
import Utils from '../domain/Utils'

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default class CameraModel extends RhelenaPresentationModel {

    constructor(props) {
        super();
        this.props = props;

        this.flash = RNCamera.Constants.FlashMode.off
        this.type = RNCamera.Constants.Type.front
        this.ratio = '16:9'

        this.paused = true
        this.state = 'idle'

        //used to avoid infinited re-rendering
        this.camera = { camera: null }

        this.selectedTrack = null


        this.recordOptions = {
            maxDuration: 5,
            quality: RNCamera.Constants.VideoQuality['720p'],
            codec: RNCamera.Constants.VideoCodec['H264'],
            orientation: 'portrait',
            mirrorVideo: false,
            path: '/test/test.mp4'
        }

        this.lastRecording = null

        this.recordingStartTime = null
        this.referenceTimeOffset = null
        this.referenceTrackId = null

        this.showVideoPicker = false

        this.tracks = []
        this.cameraRollImage = null
        this.saveToCameraRoll = false

        this.loadCameraRollPreview()

        //FOR TESTING
        var t = new Track(
            uuidv4(),
            require('../resources/test-30fps-360p.mp4'),
            1.0, false, false, this.tracks.length, this.referenceTrackId, this.referenceTimeOffset
        )
        this.addTrack(t)
    }

    loadCameraRollPreview = () => {
        if (this.cameraRollImage == null) {
            var options = {
                first: 1,
                assetType: "Videos"
            }
            CameraRoll.getPhotos(options).then((photos) => {
                if (photos.edges.length > 0) {
                    this.cameraRollImage = { uri: Utils.phToAssetsUri(photos.edges[0].node.image.uri) }
                } else {
                    this.cameraRollImage = require('../resources/test-30fps-360p.mp4')
                }
            }).catch((err) => {
                console.warn('Error getting photo: ' + err)
            })
        }
    }



    //VIDEO PLAYBACK
    startVideo = (e) => {
        console.log(new Date().getTime() + " startVideo")

        for (var i = 0; i < this.tracks.length; i++) {
            var t = this.tracks[i]
            t.preparePlay()
        }

        setTimeout(()=>{
            this.paused = false
        }, 500); 
    }

    stopVideo = (e) => {
        console.log(new Date().getTime() + " stopVideo")
        this.state = 'idle'
        this.paused = true
    }

    togglePlaying = async () => {
        if (this.state == 'playing') {
            this.stopVideo()
        } else {
            this.state = 'playing'
            this.startVideo()
        }
    }

    onVideoEnd = (videoModel) => {
        if (this.state == 'playing') {
            var anyStillPlaying = false
            for (var i = 0; i < this.tracks.length; i++) {
                var t = this.tracks[i]
                if (t.playing) {
                    anyStillPlaying = true
                }
            }
            if (!anyStillPlaying) {
                this.stopVideo()
            }
        }

        //force update
        this.tracks = this.tracks
    }




    //TRACKS
    showTrackDialog(track) {
        console.log("TRACK DIALOG ")
        this.selectedTrack = track
    }

    sortedTracks = () => {
        return this.tracks.sort((a, b) => {
            return a.order < b.order
        })
    }

    addTrack = (track) => {
        var trackModel = new TrackModel(track, this)
        if (track.order == 0) {
            this.referenceTrackId = track.id
            console.log("REFERENCE TRACKID=" + track.id)
        }
        this.tracks.push(trackModel)
    }

    addTrackFromCameraRoll = async () => {
        this.showVideoPicker = true
    }

    onVideoSelected = async (images, current) => {
        console.log("ADDING NEW TRACK FROM CAMERA ROLL " + Utils.phToAssetsUri(current.uri))

        var t = new Track(
            uuidv4(),
            { uri: Utils.phToAssetsUri(current.uri) },
            1.0, false, false, this.tracks.length, null, null
        )
        this.addTrack(t)
        this.showVideoPicker = false
    }




    //CAMERA
    toggleRecording = async () => {
        if (this.state == 'idle') {
            this.startRecording()
        } else {
            this.stopRecording()
        }
    }

    startRecording = async () => {
        if (this.state == 'idle') {
            this.state = 'preparing'
            this.lastRecording = null
            console.log("START RECORDING")

            const options = {
                quality: '480p',
                maxDuration: 300,
                maxFileSize: 200 * 1024 * 1024
            };

            console.log(new Date().getTime() + ' starting recording')

            this.camera.camera.recordAsync(options).then((result) => {
                console.log(new Date().getTime() + " finished recording")

                this.lastRecording = result

                if (this.saveToCameraRoll) {
                    CameraRoll.saveToCameraRoll(result.uri, "video").then((uri) => {
                        console.log("Video saved to camera roll successfuly");
                        this.createAndAddTrack(Utils.phToAssetsUri(uri))

                    }).catch((err) => {
                        console.warn("Failed to store recorded video: " + err.message);
                    });
                } else {
                    this.createAndAddTrack(result.uri)
                }

            }).catch((err) => {
                console.warn("Video recording error. err=" + err);
            })
        }
    }

    createAndAddTrack = (uri) => {
        console.log("ADDING NEW TRACK FROM RECORDING " + Utils.phToAssetsUri(uri))
        var t = new Track(
            uuidv4(),
            { uri: uri },
            1.0, false, false, this.tracks.length, this.referenceTrackId, this.referenceTimeOffset
        )
        this.addTrack(t)
        this.stopVideo()
    }

    stopRecording = () => {
        console.log("STOP RECORDING")
        if (this.state == 'recording') {
            this.camera.camera.stopRecording();
        }
    }

    toggleCamera = () => {
        if (this.type == RNCamera.Constants.Type.front) {
            this.type = RNCamera.Constants.Type.back
        } else {
            this.type = RNCamera.Constants.Type.front
        }
    }

    borderRecording = () => {
        if (this.state == 'recording') {
            return {
                borderColor: "#FF0000",
                borderRadius: 6,
                borderWidth: 4,
            }
        }
        return {}
    }

    onRecordingStart = (e) => {
        this.state = 'recording'
        console.log(new Date().getTime() + ' onRecordingStart')
        this.recordingStartTime = new Date().getTime()
        this.startVideo()
    }

    onRecordingEnd = (e) => {
        console.log(new Date().getTime() + ' onRecordingEnd')
        this.state = 'idle'
    }

    onAudioInterrupted = (err) => {
        console.log(new Date().getTime() + ' onAudioInterrupted. err=' + err)
        console.log("ERROR: Audio interrupted so recording was canceled")
        this.stopRecording()
    }

    onMountError = (err) => {
        console.log(new Date().getTime() + ' onMountError. err=' + err)
        console.log("ERROR: Mount error so recording was canceled")
        this.stopRecording()
    }



    //BOTTOM BAR
    recordIcon = () => {
        if (this.state == 'recording') {
            return 'controller-stop'
        } else {
            return 'controller-record'
        }
    }

    playIcon = () => {
        if (this.state == 'playing') {
            return 'controller-stop'
        } else {
            return 'controller-play'
        }
    }

    timeColor = () => {
        if (this.state == 'playing') {
            return '#00FF00'
        } else {
            return 'red'
        }
    }

    showPlayControl = () => {
        return this.tracks.length > 0 && this.state != 'recording'
    }

    showRecordControl = () => {
        return this.state != 'playing'
    }

    showAddCameraRollControl = () => {
        return this.state == 'idle' && this.cameraRollImage != null
    }

}


class TrackModel {
    constructor(track, cameraModel) {
        this.track = track
        this.cameraModel = cameraModel
        this.player = null
        this.playing = false
    }

    preparePlay = () => {
        if (!this.videoMute || !this.audioMute) {
            this.playing = true
            if (this.track.referenceTimeOffset != null) {
                console.log('Seeking offset ' + this.track.referenceTimeOffset + '; track='+ this.track.id +'; reftrack=' + this.track.referenceTrackId)
                this.player.seek(this.track.referenceTimeOffset / 1000.0, 0)
            } else {
                console.log('No offset for track ' + this.track.id)
                this.player.seek(0, 0)
            }
        }
    }

    onError = (err) => {
        console.log(new Date().getTime() + ' onError - track=' + this.track.id + '; err= ' + err)
        this.playing = false
    }

    onEnd = () => {
        console.log(new Date().getTime() + ' onEnd - track=' + this.track.id)
        this.playing = false
        this.cameraModel.onVideoEnd(this)
    }

    onProgress = (e) => {
        console.log(new Date().getTime() + ' onProgress track=' + this.track.id + '; time=' + e.currentTime * 1000)

        //only process on progress for reference track. ignore all others
        if (this.cameraModel.referenceTrackId == null || this.cameraModel.referenceTrackId != this.track.id) {
            return
        }

        if (this.cameraModel.state == 'recording') {
            var playerElapsed = e.currentTime * 1000

            //this info has very low time skew too
            var recorderElapsed = (new Date().getTime() - this.cameraModel.recordingStartTime)

            //this skew was added experimentally for better sounding on my iPhone
            //must be evaluated on various devices
            var customOffset = 0
            var toffset = recorderElapsed - playerElapsed - customOffset
            console.log('reference track=' + this.track.id + '; toffset=' + toffset)

            //use min value because it will probably represent the sample with 
            //less latency from notification queue
            if (toffset > 100 && (toffset < this.cameraModel.referenceTimeOffset || this.cameraModel.referenceTimeOffset == null)) {
                this.cameraModel.referenceTimeOffset = toffset
            }

            console.log("recordingStartTime: " + this.cameraModel.recordingStartTime)
            console.log("videoStartTime:     " + (this.cameraModel.recordingStartTime + this.cameraModel.referenceTimeOffset))
            console.log("player toffset: " + (this.cameraModel.referenceTimeOffset) + "ms")
            // }
        }
    }

    borderVideo = () => {
        if (this.track.audioMute && this.track.videoMute) {
            return { borderWidth: 4 }
        }
        if (this.cameraModel.state == 'recording' || this.cameraModel.state == 'playing') {
            console.log("BORDER VIDEO")
            console.log(this.playing)
            if (!this.playing) {
                return { borderWidth: 7 }
            }
            return {
                borderColor: "#00FF00",
                borderRadius: 6,
                borderWidth: 2,
            }
        }
        if (this.cameraModel.state == 'preparing') {
            return {
                borderColor: "yellow",
                borderRadius: 6,
                borderWidth: 2,
            }
        }
        return {}
    }

}
