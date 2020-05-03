export default class Utils {

    static phToAssetsUri(phUri) {
        const ext = 'mp4'
        const appleId = phUri.substring(5, 41);
        return `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;
    }

    static calculatePlaybackOffsets(tracksModel) {
        console.log("calculatePlaybackOffsets")

        console.log("Look for root node")
        var rootTrack = null
        for (var i = 0; i < this.tracks.length; i++) {
            var t = this.tracks[i]
            if(t.track.referenceTrackId!=null) {
                var rt = this.getTrackModelById(t.track.referenceTrackId)
                if(rt==null) {
                    console.warn("Track id " + t.track.id + " has a time reference to inexistent track " + t.track.referenceTrackId)
                }
            } else {
                if(rootTrack!=null) {
                    console.warn("Found duplicate root tracks (tracks without time reference). Ignoring last.")
                }
            }
        }
    }

}
