import db from "./database"

import { playlistsSet } from '../redux/slices/playlistSlice'
import { tracksSet } from "../redux/slices/trackSlice"
import { playlistsContentSet } from "../redux/slices/playlistContentSlice"
import { artistsSet } from "../redux/slices/artistSlice"
import { currentConfigSet, currentIndexSet, currentMillisSet, orderMapSet, syncedWithDatabase } from "../redux/slices/queueSlice"

import { PlaylistBridge, QueueBridge, TrackBridge } from "./componentBridge"
import { createPlaylist, createTrack } from "./shapes"
import { PLATFORMS, RESERVED_PLAYLISTS, TABLES } from "../constants"
import { setBoolean } from "../redux/slices/playlistConfigSlice"
import TrackPlayer, { RepeatMode } from "react-native-track-player"


const loadQueueFromDB = async (dispatch) => {
    const queueRow = await db.selectFrom(TABLES.QUEUE);
    const data = queueRow[0];

    dispatch(currentIndexSet(data.currentIndex));
    dispatch(currentMillisSet(data.currentMillis));
    dispatch(currentConfigSet(data.playlistConfigId));

    const configRows = await db.selectFrom(TABLES.PLAYLIST_CONFIG, null, "id = ?", [data.playlistConfigId]);

    if(configRows.length > 0) {
        const data = configRows[0];

        dispatch(orderMapSet(JSON.parse(data.orderMap)));
        dispatch(setBoolean({value: data.isLooping, optionName: "LOOP"}));
        dispatch(setBoolean({value: data.isShuffling, optionName: "SHUFFLE"}));
        dispatch(setBoolean({value: data.isReversing, optionName: "REVERSE"}));
    }

    dispatch(syncedWithDatabase(true));
}

const createMockupPlaylist = (dispatch) => {
    return new Promise(async (resolve, reject) => {
        await db.resetSequenceFor(TABLES.PLAYLIST);
        await db.resetSequenceFor(TABLES.PLAYLIST_CONFIG);

        await db.existsIn(TABLES.PLAYLIST, "title=?", ["Un playlist"]).catch(async () => {
            const rs = await PlaylistBridge.addPlaylist(createPlaylist("Un playlist", "descriere smechera"), dispatch, false, false);
            
            await db.insertInto(TABLES.PLAYLIST_CONFIG, { playlistId: rs.insertId });
        });

        //await createMockupTracks(20, dispatch);

        resolve();
    });
}

const createMockupTracks = (count, dispatch) => {
    return new Promise(async (resolve, reject) => {
        await db.existsIn(TABLES.PLAYLIST, "id=? AND title=?", [1, "Un playlist"]).then(async () => {
            const idArr = Array.from(Array(count).keys());
            idArr.shift();
            idArr.push(count);

            for (let num of idArr) {
                const platforms = Object.keys(PLATFORMS);
                const randPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    
                await TrackBridge.addTrack({ track: createTrack(`Track ${num}`, `some uri ${num}`, "DEFAULT", randPlatform, 85000) }, dispatch, false);
            }

            await PlaylistBridge.linkTracks(1, idArr, dispatch, false, false);
            QueueBridge.resetReduxState(dispatch);

            resolve();
        }).catch(reject);
    });
}



export async function setupDatabase(dispatch) {
    return db.init().then(async () => {
        // TODO remove createMockupPlaylist when the app is done
        //await createMockupPlaylist(dispatch);

        await db.insertIfNotExists(TABLES.QUOTE, { lastFetch: 0 }, "id=?", [1]);

        for(let reserved of RESERVED_PLAYLISTS) {
            await db.insertIfNotExists(TABLES.PLAYLIST, { title: reserved }, "title=?", [reserved]);
        }

        await db.insertIfNotExists(TABLES.QUEUE, { currentIndex: 0, playlistConfigId: -1 }, "id=?", [1]);

        await loadQueueFromDB(dispatch);

        await db.selectFrom(TABLES.TRACK).then(rows => {
            dispatch(tracksSet(rows));
        });

        await db.selectFrom(TABLES.ARTIST).then(rows => {
            dispatch(artistsSet(rows));
        });

        await db.selectFrom(TABLES.PLAYLIST).then(async rows => {
            dispatch(playlistsSet(rows));
            const links = await db.selectFrom(TABLES.PLAYLIST_CONTENT);

            for(const playlist of rows) {
                const defaultMap = links
                    .filter(link => link.playlistId == playlist.id)
                    .map(link => link.trackId);

                await db.insertIfNotExists(TABLES.PLAYLIST_CONFIG, { playlistId: playlist.id, orderMap: JSON.stringify(defaultMap) }, "playlistId=?", [playlist.id]);
            }
        });

        await db.selectFrom(TABLES.PLAYLIST_CONTENT)
            .then(rows => dispatch(playlistsContentSet(rows)));
    });
}