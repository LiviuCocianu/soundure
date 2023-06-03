import { TrackBridge } from "../database/componentBridge"
import { handleCoverURI } from "../functions"

/**
 * Wrap a database track object in an object that can be used by TrackPlayer
 * 
 * @param {{ id: number, title: string, fileURI: string, coverURI: string | NodeRequire | undefined, millis: number | undefined }} track
 */
export const wrap = async (track) => {
    const {
        id,
        title,
        fileURI,
        coverURI="DEFAULT",
        millis=0
    } = track;

    const artist = await TrackBridge.getArtist(id);
    const cover = handleCoverURI(coverURI);
    const artwork = cover.uri ? cover.uri : cover;

    return {
        id,
        url: fileURI,
        title: title,
        artist: artist.name,
        artwork,
        duration: Math.floor(millis / 1000)
    }
}