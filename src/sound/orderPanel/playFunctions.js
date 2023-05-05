import { Dispatch, AnyAction } from "redux"
import TrackPlayer, { RepeatMode } from "react-native-track-player";
import { TABLES } from "../../constants";
import { PlaylistBridge, QueueBridge } from "../../database/componentBridge"
import db from "../../database/database";
import { wrap } from "../trackBridge";


/**
 * Load the tracks into the player without playing
 * 
 * @param {number[]} orderMap An ordered list of track IDs to play
 */
export const loadTracks = async (orderMap) => {
    const orderMapTracks = await db.selectFrom(TABLES.TRACK, null, `id IN (${orderMap.join(", ")})`);

    for (const track of orderMapTracks) {
        const wrapped = await wrap(track);
        await TrackPlayer.add(wrapped);
    }
}

/**
 * Plays or resumes the current queue
 * 
 * @param {number[]} orderMap An ordered list of track IDs to play
 */
export const play = async (orderMap) => {
    await loadTracks(orderMap);
    await TrackPlayer.play();
}

/**
 * Sends the queue index back to the beginning and plays
 * 
 * @param {Dispatch<AnyAction>} dispatch Redux dispatch
 */
export const loopBack = async (dispatch) => {
    const currentPlaylist = await QueueBridge.getCurrentPlaylist();

    if (currentPlaylist) {
        const row = await PlaylistBridge.getConfig(currentPlaylist.id);
        const parsedMap = JSON.parse(row.orderMap);
    
        await QueueBridge.setIndex(0, dispatch);
        await QueueBridge.setCurrentMillis(0, dispatch);

        await TrackPlayer.reset();
        await play(parsedMap);
    } else {
        throw new Error("loopBack error: Cannot loop as there is no playlist to loop tracks from");
    }
}

/**
 * Skips to a track in the queue and updates the player
 * 
 * @param {number} index 
 * @param {Dispatch<AnyAction>} dispatch Redux dispatch
 * @param {boolean} play If track should play automatically after skipping to it
 */
export const skipTo = async (index, dispatch, play=true) => {
    await QueueBridge.setIndex(index, dispatch);
    await TrackPlayer.skip(index);
    if(play) await TrackPlayer.play();
};

/**
 * Adds the tracks from the playlist to the queue and plays them without any alteration to the order.
 * Any previous tracks in the player will be overwritten
 * 
 * @param {number} playlistId Target playlist ID
 * @param {Dispatch<AnyAction>} dispatch Redux dispatch
 */
export const simplePlay = async (playlistId, dispatch) => {
    const row = await PlaylistBridge.getConfig(playlistId);
    const parsedMap = JSON.parse(row.orderMap);

    await QueueBridge.setCurrentConfig(row.id, dispatch);
    await QueueBridge.setOrderMap(parsedMap, dispatch, false);
    await QueueBridge.setIndex(0, dispatch);

    await TrackPlayer.reset();

    await play(parsedMap);
}