import { Dispatch, AnyAction } from "redux"
import TrackPlayer from "react-native-track-player";

import { PlaylistBridge, QueueBridge } from "../../database/componentBridge"
import { wrap } from "../trackBridge";
import Toast from "react-native-root-toast";
import { find, shuffle } from "../../functions";


/**
 * Appends the tracks to the player queue without playing
 * 
 * @param {number[]} orderMap An ordered list of track IDs to play
 */
export const loadTracks = async (orderMap, tracks) => {
    const orderMapTracks = orderMap.map(id => find(tracks, "id", id));

    await TrackPlayer.add(await Promise.all(orderMapTracks.map(async tr => {
        console.log("wrapping load"); // TODO debug
        return await wrap(tr);
    })));
}

/**
 * Updates the queue order in both the UI and the track player
 * 
 * @param {object[]} tracks All the tracks in the database
 * @param {number[]} orderMap New order map. A list of IDs
 * @param {number} index Current index
 * @param {number} millis Current millis
 * @param {boolean} playing Whether there is a queue currently playing
 * @param {Dispatch<AnyAction} dispatch Redux dispatch
 */
export const updateQueueOrder = async (tracks, orderMap, index, millis, playing, dispatch) => {
    Toast.show("Se schimbă ordinea..", { duration: Toast.durations.LONG });

    await TrackPlayer.reset();
    
    await loadTracks(orderMap, tracks);

    await skipTo(index, dispatch, false);
    await TrackPlayer.seekTo(Math.floor(millis / 1000));

    if(playing) await TrackPlayer.play();

    Toast.show("Ordine schimbată!");
}

/**
 * Plays or resumes the current queue
 * 
 * @param {number[]} orderMap An ordered list of track IDs to play
 * @param {object[]} tracks All the tracks in the database
 */
export const play = async (orderMap, tracks) => {
    await loadTracks(orderMap, tracks);
    await TrackPlayer.play();
}

/**
 * Sends the queue index back to the beginning and plays
 * 
 * @param {object[]} tracks All the tracks in the database
 * @param {Dispatch<AnyAction>} dispatch Redux dispatch
 */
export const loopBack = async (tracks, dispatch) => {
    const currentPlaylist = await QueueBridge.getCurrentPlaylist();

    if (currentPlaylist) {
        const row = await PlaylistBridge.getConfig(currentPlaylist.id);
        const parsedMap = JSON.parse(row.orderMap);
    
        await QueueBridge.setIndex(0, dispatch);
        await QueueBridge.setCurrentMillis(0, dispatch);

        await TrackPlayer.reset();
        await play(parsedMap, tracks);
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

const prepareForPlay = async (playlistId, dispatch) => {
    const row = await PlaylistBridge.getConfig(playlistId);
    const parsedMap = JSON.parse(row.orderMap);

    await QueueBridge.setCurrentConfig(row.id, dispatch);
    await QueueBridge.setIndex(0, dispatch);
    await TrackPlayer.reset();

    return parsedMap;
}

/**
 * Adds the tracks from the playlist to the queue and plays them without any alteration to the order.
 * Any previous tracks in the player will be overwritten
 * 
 * @param {number} playlistId Target playlist ID
 * @param {object[]} tracks All the tracks in the database
 * @param {Dispatch<AnyAction>} dispatch Redux dispatch
 */
export const simplePlay = async (playlistId, tracks, dispatch) => {
    const orderMap = await prepareForPlay(playlistId, dispatch);

    await QueueBridge.setOrderMap(orderMap, dispatch, false);
    await play(orderMap, tracks);
}

/**
 * Adds the tracks from the playlist to the queue and plays them shuffled.
 * Any previous tracks in the player will be overwritten
 * 
 * @param {number} playlistId Target playlist ID
 * @param {object[]} tracks All the tracks in the database
 * @param {Dispatch<AnyAction>} dispatch Redux dispatch
 */
export const shuffledPlay = async (playlistId, tracks, dispatch) => {
    let orderMap = await prepareForPlay(playlistId, dispatch);
    orderMap = shuffle(orderMap);

    await QueueBridge.setOrderMap(orderMap, dispatch, false);
    await play(orderMap, tracks);
}

/**
 * Adds the tracks from the playlist to the queue and plays them in reversed order.
 * Any previous tracks in the player will be overwritten
 * 
 * @param {number} playlistId Target playlist ID
 * @param {object[]} tracks All the tracks in the database
 * @param {Dispatch<AnyAction>} dispatch Redux dispatch
 */
export const reversedPlay = async (playlistId, tracks, dispatch) => {
    let orderMap = await prepareForPlay(playlistId, dispatch);
    orderMap = orderMap.reverse();

    await QueueBridge.setOrderMap(orderMap, dispatch, false);
    await play(orderMap, tracks);
}