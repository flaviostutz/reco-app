export default class Utils {

    static phToAssetsUri(phUri) {
        const ext = 'mp4'
        const appleId = phUri.substring(5, 41);
        return `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;
    }

}
