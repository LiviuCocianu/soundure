import db from "./database"

import { playlistsSet } from '../redux/slices/playlistSlice'
import { tracksSet } from "../redux/slices/trackSlice"
import { playlistsContentSet } from "../redux/slices/playlistContentSlice"
import { artistsSet } from "../redux/slices/artistSlice"
import { PLATFORMS, RESERVED_PLAYLISTS, TABLES } from "../constants"
import { currentIndexSet, currentMillisSet, orderMapSet } from "../redux/slices/queueSlice"
import { PlaylistBridge, TrackBridge } from "./componentBridge"
import { createPlaylist, createTrack } from "./shapes"


const loadQueueFromDB = (dispatch) => {
    db.selectFrom(TABLES.QUEUE).then(rows => {
        const data = rows[0];

        dispatch(currentIndexSet(data.currentIndex));
        dispatch(currentMillisSet(data.currentMillis));
        dispatch(orderMapSet(JSON.parse(data.orderMap)));
    });
}

const createMockupPlaylist = (dispatch) => {
    return new Promise(async (resolve, reject) => {
        await db.existsIn(TABLES.PLAYLIST, "title=?", ["Un playlist"]).catch(async () => {
            await PlaylistBridge.addPlaylist(createPlaylist("Un playlist", "descriere smechera"), dispatch, false);
        
            for (let num of Array.from(Array(50).keys())) {
                const platforms = Object.keys(PLATFORMS);
                const randPlatform = platforms[Math.floor(Math.random() * platforms.length)];

                await TrackBridge.addTrack({ track: createTrack(`Track ${num}`, `some uri ${num}`, randPlatform, 85000) }, dispatch, false);
                await PlaylistBridge.linkTracks([{trackId: num+1, playlistId: 1}], dispatch, false);
            }
        });

        resolve();
    });
}



export function setupDatabase(dispatch, setLoadedDatabase) {
    db.resetAndInit().then(() => {
        // TODO remove createMockupPlaylist when the app is done
        createMockupPlaylist(dispatch).then(async () => {
            await db.insertIfNotExists(TABLES.QUOTE, { lastFetch: 0 }, "id=?", [1]);

            for(let reserved of RESERVED_PLAYLISTS) {
                await db.insertIfNotExists(TABLES.PLAYLIST, { title: reserved }, "title=?", [reserved]);
            }

            // TODO empty hardcoded orderMap array when I implement a way to add tracks to the queue from the UI
            await db.insertIfNotExists(TABLES.QUEUE, { orderMap: JSON.stringify([1, 2, 3, 4, 5]) }, "id=?", [1]).then(() => {
                loadQueueFromDB(dispatch);
            });

            await db.selectFrom(TABLES.TRACK).then(rows => {
                dispatch(tracksSet(rows));
            });

            await db.selectFrom(TABLES.ARTIST).then(rows => {
                dispatch(artistsSet(rows));
            });

            await db.selectFrom(TABLES.PLAYLIST).then(rows => {
                dispatch(playlistsSet(rows));
            });

            await db.selectFrom(TABLES.PLAYLIST_CONTENT)
                .then(rows => dispatch(playlistsContentSet(rows)))
        }).then(() => setLoadedDatabase(true));
    })
}