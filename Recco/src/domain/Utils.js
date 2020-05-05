export default class Utils {

    static phToAssetsUri(phUri) {
        const ext = 'mp4'
        const appleId = phUri.substring(5, 41);
        return `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;
    }

    static calculatePlaybackOffsets(tracksModel) {
        console.log("calculatePlaybackOffsets")
        for (var i = 0; i < tracksModel.length; i++) {
            var t = tracksModel[i]
            t.rootOffset = Utils.calcOffsetToRoot(tracksModel, t)
            console.log('Track id ' + t.track.id + ' offset=' + t.rootOffset)
        }
    }

    static calcOffsetToRoot(tracksModel, fromTrack) {
        if (fromTrack.track.referenceTrackId == null) {
            return 0
        }
        var referenceTrack = Utils.getTrackModelById(tracksModel, fromTrack.track.referenceTrackId)
        if (referenceTrack == null) {
            console.log("REFERENCE TRACK ID " + fromTrack.track.referenceTrackId + " NOT FOUND AMONG TRACKS. ABORTING")
            return null
        }
        return fromTrack.track.referenceTimeOffset + Utils.calcOffsetToRoot(tracksModel, referenceTrack)
    }

    static getTrackModelById(tracksModel, trackId) {
        for (var i = 0; i < tracksModel.length; i++) {
            var t = tracksModel[i]
            if (t.track.id == trackId) {
                return t
            }
        }
        return null
    }

    static msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s
        // return 'AAA'
        return (mins>9?mins:'0'+mins) + ':' + (secs>9?secs:'0'+secs);
    }

}
