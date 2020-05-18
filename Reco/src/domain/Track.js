
export default class Track {
    constructor(id, source, volume, audioMute, videoMute, order, referenceTrackId, referenceTimeOffset) {
      this.id = id
      this.source = source
      this.volume = volume
      this.audioMute = audioMute
      this.videoMute = videoMute
      this.order = order
      this.referenceTrackId = referenceTrackId
      this.referenceTimeOffset = referenceTimeOffset
    }  
}
