import { Dispatch, AnyAction } from "redux";

import db from "./database";
import { ARTIST_NAME_PLACEHOLDER, ENV, ORDER_MUTATION_OPTIONS, PLATFORMS, QUOTE_API_URL, TABLES } from "../constants";
import Toast from "react-native-root-toast";

import { trackSet, trackAdded, trackRemoved } from "../redux/slices/trackSlice";
import { playlistAdded, playlistRemoved, playlistSet } from "../redux/slices/playlistSlice";
import { trackRelationsRemoved, playlistRelationsRemoved, trackPlaylistRelationRemoved, playlistContentAdded, playlistContentRemoved } from "../redux/slices/playlistContentSlice";
import { artistAdded } from "../redux/slices/artistSlice";
import { currentConfigSet, currentIndexSet, currentMillisSet, orderMapSet, toggledDynamicSound } from "../redux/slices/queueSlice";
import { handleCoverURI } from "../functions";
import { historyOrderSet, setBoolean } from "../redux/slices/playlistConfigSlice";
import { settingApplied } from "../redux/slices/appSettingsSlice";


const updateColumn = (table, id, setAction, { column, value, dispatch }) => {
    return db.selectFrom(table, null, "id=?", [id]).then(async rows => {
        await db.update(table, `${column}=?`, "id=?", [value, id]).then(() => {
            dispatch(setAction({ ...rows[0], [`${column}`]: value }));
        });
    });
};

const getFixedRow = async (table) => {
    return db.selectFrom(table, null, "id=?", [1]).then(rows => rows[0]);
};


export const TrackBridge = {
    updateColumn: (column, value, trackId, dispatch) => {
        return new Promise((resolve, reject) => {
            updateColumn(TABLES.TRACK, trackId, trackSet, {
                column, value, dispatch
            });

            resolve();
        });
    },
    toggleFavorite: async (trackId, dispatch, toast=true) => {
        await db.selectFrom(TABLES.TRACK, null, "id=?", [trackId]).then(async rows => {
            const track = rows[0];
            await TrackBridge.updateColumn("favorite", !track.favorite, trackId, dispatch);
    
            if(toast) {
                if(!track.favorite) {
                    Toast.show("Piesă adaugată la favorite!");
                } else {
                    Toast.show("Piesă eliminată de la favorite!");
                }
            }
        });
    },
    getArtist: async (trackId) => {
        const artistId = await db.selectFrom(TABLES.TRACK, null, "id=?", [trackId]).then(rows => {
            if(rows.length == 0) {
                throw new Error(`getArtist(${trackId}): Couldn't find artist for track with this ID`);
            } else {
                return rows[0].artistId;
            }
        });

        return db.selectFrom(TABLES.ARTIST, null, "id=?", [artistId]).then(rows => rows[0]);
    },
    setTitle: async (title, trackId, dispatch, toast=true) => {
        await TrackBridge.updateColumn("title", title, trackId, dispatch);
        if(toast) Toast.show("Titlul a fost actualizat!");
    },
    setCoverURI: async (coverURI, trackId, dispatch, toast=true) => {
        await TrackBridge.updateColumn("coverURI", JSON.stringify(handleCoverURI(coverURI)), trackId, dispatch);
        if(toast) Toast.show("Coperta a fost actualizată!");
    },
    /**
     * Adds track to database and redux store
     * @param {{track: {title: string, fileURI: string, platform: string|undefined, millis: number|undefined}, artist: string|undefined}} payload 
     * @param {Dispatch<AnyAction>} dispatch 
     * @param {boolean} [redux=true] If track should be added to the Redux store as well
     */
    addTrack: async (payload, dispatch, redux=true) => {
        const {artist=ARTIST_NAME_PLACEHOLDER, track} = payload;

        return db.insertIfNotExists(TABLES.ARTIST, { name: artist }, "name = ?", [artist]).then(async () => {
            await db.selectFrom(TABLES.ARTIST, null, "name = ?", [artist]).then(async rows => {
                const {
                    title,
                    fileURI,
                    coverURI="DEFAULT",
                    platform=PLATFORMS.NONE,
                    millis=0
                } = track;

                const artist = rows[0];

                let toInsert = { title, fileURI, coverURI, platform, millis, artistId: artist.id };

                if (redux) dispatch(artistAdded(artist));

                await db.insertInto(TABLES.TRACK, toInsert).then(rs => {
                    const payload = { id: rs.insertId, ...toInsert };
                    if (redux) dispatch(trackAdded(payload));
                });
            });
        });
    },
    deleteTrack: async (trackId, dispatch, toast=true) => {
        await db.deleteFrom(TABLES.PLAYLIST_CONTENT, "trackId=?", [trackId]).then(async () => {
            dispatch(trackRelationsRemoved({ trackId }));

            const row = await getFixedRow(TABLES.QUEUE);

            // Remove the track from all configs
            const configs = await db.selectFrom(TABLES.PLAYLIST_CONFIG, ["id", "orderMap"]);

            for(const config of configs) {
                let orderMap = JSON.parse(config.orderMap);

                if(orderMap.includes(trackId)) {
                    orderMap = JSON.stringify(orderMap.filter(id => id !== trackId));
                    await db.update(TABLES.PLAYLIST_CONFIG, "orderMap = ?", "id = ?", [orderMap, config.id]);
                }
            }

            // ... then update the queue, if there is a playlist playing
            if(row.playlistConfigId != -1) {
                const rows = await db.selectFrom(TABLES.PLAYLIST_CONFIG, ["orderMap"], "id = ?", [row.playlistConfigId]);
                
                if(rows.length > 0) {
                    let orderMap = JSON.parse(rows[0].orderMap);
                    dispatch(orderMapSet(orderMap));

                    if(orderMap.length == 0) QueueBridge.resetReduxState(dispatch);
                }
            }

            await db.deleteFrom(TABLES.TRACK, "id=?", [trackId]).then(() => {
                dispatch(trackRemoved({ id: trackId }));
                if(toast) Toast.show("Piesă eliminată!");
            });
        });
    },
    trackExists: (fileURI) => {
        return db.existsIn(TABLES.TRACK, "fileURI = ?", [fileURI]);
    },
    deleteFromPlaylist: (playlistId, trackId, dispatch, toast=true) => {
        db.deleteFrom(TABLES.PLAYLIST_CONTENT, "trackId=? AND playlistId=?", [trackId, playlistId]).then(async () => {
            dispatch(trackPlaylistRelationRemoved({ playlistId, trackId }));

            const rows = await db.selectFrom(TABLES.PLAYLIST_CONFIG, ["id", "orderMap"], "playlistId = ?", [playlistId]);
            const queue = await getFixedRow(TABLES.QUEUE);

            if (rows.length > 0) {
                const thisConfigId = rows[0].id;
                let orderMap = JSON.parse(rows[0].orderMap);

                orderMap.splice(orderMap.indexOf(trackId), 1);

                await db.update(TABLES.PLAYLIST_CONFIG, "orderMap=?", "playlistId=?", [JSON.stringify(orderMap), playlistId]);

                // Removes the track from the queue, if this playlist is playing
                if (queue.playlistConfigId == thisConfigId) {
                    dispatch(orderMapSet(orderMap));
                }
            }

            if(toast) Toast.show("Piesă eliminată din playlist!");
        });
    }
}

export const PlaylistBridge = {
    updateColumn: (column, value, playlistId, dispatch) => {
        return new Promise(async (resolve, reject) => {
            await updateColumn(TABLES.PLAYLIST, playlistId, playlistSet, {
                column, value, dispatch
            });

            resolve();
        });
    },
    setTitle: async (title, playlistId, dispatch, toast=true) => {
        await PlaylistBridge.updateColumn("title", title, playlistId, dispatch);
        if(toast) Toast.show("Titlul a fost actualizat!");
    },
    setCoverURI: async (coverURI, playlistId, dispatch, toast=true) => {
        const cover = coverURI !== "DEFAULT" ? JSON.stringify(handleCoverURI(coverURI)) : "DEFAULT";
        await PlaylistBridge.updateColumn("coverURI", cover, playlistId, dispatch);
        if(toast) Toast.show("Coperta a fost actualizată!");
    },
    /**
     * Adds playlist to database and redux store
     * @param {{title: string, description: string|undefined, coverURI: string}} payload 
     * @param {Dispatch<AnyAction>} dispatch
     * @param {boolean} [redux=true] If playlist should be added to the Redux store as well
     */
    addPlaylist: async (payload, dispatch, redux=true, toast=true) => {
        return db.insertInto(TABLES.PLAYLIST, payload).then(async rs => {
            const completePayload = {id: rs.insertId, ...payload};
            if (redux) dispatch(playlistAdded(completePayload));

            await db.insertInto(TABLES.PLAYLIST_CONFIG, {playlistId: rs.insertId});

            if(toast) Toast.show("Playlist creat!");

            return rs;
        });
    },
    deletePlaylist: async (playlistId, dispatch, toast=true) => {
        return db.deleteFrom(TABLES.PLAYLIST_CONTENT, "playlistId = ?", [playlistId]).then(async () => {
            dispatch(playlistRelationsRemoved({ playlistId }));

            await db.deleteFrom(TABLES.PLAYLIST, "id = ?", [playlistId]);
            dispatch(playlistRemoved({ id: playlistId }));

            await getFixedRow(TABLES.QUEUE).then(async row => {
                const rows = await db.selectFrom(TABLES.PLAYLIST_CONFIG, ["id"], "playlistId = ?", [playlistId]);

                if(rows.length > 0) {
                    if(row.playlistConfigId == rows[0].id) {
                        QueueBridge.resetReduxState(dispatch);
                    }
                } else {
                    console.warn(`Playlist delete warning: There is no config for playlist with ID ${playlistId}`);
                }
            });

            await db.deleteFrom(TABLES.PLAYLIST_CONFIG, "playlistId = ?", [playlistId]);

            if(toast) Toast.show("Playlist eliminat!");
        });
    },
    /**
     * Establish what track belongs to what playlist
     * @param {number} targetPlaylistId The playlist that will receive these tracks
     * @param {number[]} trackIds The tracks to link to the playlist
     * @param {Dispatch<AnyAction>} dispatch 
     * @param {boolean} [redux=true] If link should be added to the Redux store as well
     * @param {boolean} [toast=true] If a tost message should be displayed
     */
    linkTracks: (targetPlaylistId, trackIds, dispatch, redux=true, toast=true) => {
        return new Promise(async (resolve, reject) => {
            const links = trackIds.map(trackId => ({
                playlistId: targetPlaylistId,
                trackId
            }));

            db.insertBulkInto(TABLES.PLAYLIST_CONTENT, links)
                .then(async rsArr => {
                    rsArr.forEach(rs => {
                        const payl = rs.payload;
                        if (redux) dispatch(playlistContentAdded({ id: rs.insertId, ...payl }));
                    });

                    const config = await PlaylistBridge.getConfig(targetPlaylistId);
                    const configMap = JSON.parse(config.orderMap);
                    const notIncluded = trackIds.filter(id => !configMap.includes(id));

                    if(notIncluded.length > 0) {
                        const orderMap = JSON.stringify([...configMap, ...notIncluded]);

                        await db.update(TABLES.PLAYLIST_CONFIG, "orderMap=?", "playlistId=?", [orderMap, targetPlaylistId]);
                    }
                }).then(() => {
                    if(toast) Toast.show(links.length != 1 ? "Piesele au fost adăugate!" : "Piesa a fost adăugată!");
                    resolve();
                });
        });
    },
    isLinkedTo: async (trackId, playlistId) => {
        return db.existsIn(TABLES.PLAYLIST_CONTENT, "trackId=? AND playlistId=?", [trackId, playlistId]).then(() => true).catch(() => false);
    },
    getConfig: async (playlistId) => {
        return await db.selectFrom(TABLES.PLAYLIST_CONFIG, null, "playlistId=?", [playlistId]).then(rows => {
            if(rows.length == 0) {
                console.warn(`Playlist getConfig(${playlistId}): Couldn't find a config for playlist with this ID`);
            } else return rows[0];
        });
    },
    History: {
        add: async (trackId, dispatch) => {
            const rows = await db.selectFrom(TABLES.PLAYLIST, null, "title=?", ["_HISTORY"]);

            if(rows.length > 0) {
                const data = rows[0];
                const config = await PlaylistBridge.getConfig(data.id);
                
                if(config) {
                    const orderMap = JSON.parse(config.orderMap);

                    if(orderMap.includes(trackId))
                        orderMap.splice(orderMap.indexOf(trackId), 1);

                    orderMap.push(trackId);

                    await db.update(TABLES.PLAYLIST_CONFIG, "orderMap=?", "id=?", [JSON.stringify(orderMap), data.id]);

                    dispatch(historyOrderSet(orderMap));

                    //await db.deleteFrom(TABLES.PLAYLIST_CONTENT, "trackId=? AND playlistId=?", [trackId, data.id]);
                    //dispatch(trackPlaylistRelationRemoved({trackId, playlistId: data.id}));
                }

                // try {
                //     await PlaylistBridge.linkTracks(data.id, [trackId], dispatch, true, false);
                // } catch(e) {}
            }
        }
    }
}

export const QuoteBridge = {
    canFetchQuote: async () => {
        return new Promise((resolve, reject) => {
            getFixedRow(TABLES.QUOTE).then(row => {
                const currentMillis = new Date().getTime();
                const canFetch = (currentMillis - row.lastFetch) > (1000 * 60 * 60 * 24);

                if(canFetch) resolve();
                else reject();
            });
        });
    },
    fetchQuote: async () => {
        return QuoteBridge.canFetchQuote()
            .then(async () => {
                return fetch(QUOTE_API_URL, { headers: { "X-Api-Key": ENV.QUOTE_API_KEY } })
                            .then(res => res.json())
                            .then(res => res[0])
                            .then(res => {
                                const quote = res.quote;
                                const author = res.author;
                                const lastFetch = new Date().getTime();

                                db.update(TABLES.QUOTE, "lastFetch=?, quote=?, author=?", "id=?", [lastFetch, quote, author, 1]);

                                return { quote, author };
                            })
                            .catch(error => {
                                console.log("Failed to fetch daily quote:", error.message);
                            });
            })
            .catch(async () => {
                return getFixedRow(TABLES.QUOTE).then(row => {
                    return ({quote, author} = row);
                });
            })
    },
    updatesDaily: async () => {
        return db.selectFrom(TABLES.QUOTE, ["updateDaily"]).then(rows => {
            const row = rows[0];
            return row.updateDaily;
        });
    },
    toggleDailyUpdate: () => {
        return new Promise(async (resolve, reject) => {
            QuoteBridge.updatesDaily().then(async updates => {
                await db.update(TABLES.QUOTE, "updateDaily=?", "id=?", [!updates, 1]);

                if (updates) Toast.show("Ai dezactivat citatele zilnice!");
                else Toast.show("Ai activat citatele zilnice!");

                resolve();
            });
        })
    }
}

export const QueueBridge = {
    resetReduxState: (dispatch) => {
        dispatch(currentIndexSet(0));
        dispatch(currentMillisSet(0));
        dispatch(currentConfigSet(-1));
        dispatch(orderMapSet([]));
    },
    getCurrentPlaylist: async () => {
        return getFixedRow(TABLES.QUEUE).then(async row => {
            if(row.playlistConfigId != -1) {
                const rows = await db.selectFrom(TABLES.PLAYLIST_CONFIG, ["playlistId"], "id = ?", [row.playlistConfigId]);

                if(rows.length > 0) {
                    const playlistRows = await db.selectFrom(TABLES.PLAYLIST, null, "id = ?", [rows[0].playlistId]);
                    
                    if(playlistRows.length > 0) return playlistRows[0];
                    else {
                        console.warn(`getCurrentPlaylist(): There is no playlist with the ID of ${rows[0].playlistId}`);
                        return null;
                    }
                } else {
                    console.warn(`getCurrentPlaylist(): Couldn't find any config with the ID of ${row.playlistConfigId}`);
                    return null;
                }
            } else {
                console.warn("getCurrentPlaylist(): Currently the player is not assigned any config to play");
                return null;
            }
        });
    },
    setIndex: async (index, dispatch) => {
        return getFixedRow(TABLES.QUEUE).then(row => {
            if (!row.playlistConfigId || row.playlistConfigId == -1) {
                console.warn("Couldn't set queue index because destination config is not defined. Add a playlist to the queue then try again..");
                return;
            }

            db.selectFrom(TABLES.PLAYLIST_CONFIG, ["orderMap"], "id=?", [row.playlistConfigId]).then(rows => {
                const row = rows[0];
                const orderMapLen = JSON.parse(row.orderMap).length;
    
                if (index >= 0 && index < orderMapLen) {
                    db.update(TABLES.QUEUE, "currentIndex=?", "id=?", [index, 1]).then(rs => {
                        dispatch(currentIndexSet(index));
                    });
                }
            });
        });
    },
    incrementIndex: async (dispatch) => {
        return getFixedRow(TABLES.QUEUE).then(async row => {
            await QueueBridge.setIndex(row.currentIndex + 1, dispatch);
        });
    },
    setCurrentConfig: async (playlistConfigId, dispatch) => {
        return db.update(TABLES.QUEUE, "playlistConfigId=?", "id=?", [playlistConfigId, 1]).then(async () => {
            await dispatch(currentConfigSet(playlistConfigId));
        });
    },
    /**
     * Set the millisecond the current track is at.
     * 
     * @param {number} millis 
     * @param {Dispatch<AnyAction>} dispatch 
     * @param {(['database']|['redux']|['database', 'redux'])} [sendTo] Where to send the changes.
     * By default, they will be sent to both the database and the Redux store
     */
    setCurrentMillis: async (millis, dispatch, sendTo=["database", "redux"]) => {
        if(millis >= 0) {
            if (sendTo.includes("database") && sendTo.includes("redux"))
                await db.update(TABLES.QUEUE, "currentMillis=?", "id=?", [millis, 1]).then(() => {
                    dispatch(currentMillisSet(millis));
                });
            else if (sendTo.includes("database"))
                await db.update(TABLES.QUEUE, "currentMillis=?", "id=?", [millis, 1]);
            else if (sendTo.includes("redux"))
                dispatch(currentMillisSet(millis));
        }
    },
    /**
     * Set this order map in the database and in the store.
     * 
     * @param {number[]} map 
     * @param {Dispatch<AnyAction>} dispatch 
     * @param {boolean} updateCurrentConfig Default is true. If set to false, the order map of the
     * current playlist config won't be updated with the new order map
     * 
     * @returns {Promise<void>} Resolves if the changes were successful
     */
    setOrderMap: (map, dispatch, updateCurrentConfig=true) => {
        return new Promise((resolve, reject) => {
            if(Array.isArray(map)) {
                getFixedRow(TABLES.QUEUE).then(row => {
                    if (!row.playlistConfigId || row.playlistConfigId == -1) {
                        console.warn("Couldn't set order map because destination config is not defined. Add a playlist to the queue then try again..");
                        return;
                    }
    
                    const doTheDispatch = () => {
                        dispatch(orderMapSet(map));
                        resolve();
                    }
    
                    if(updateCurrentConfig) {
                        db.update(TABLES.PLAYLIST_CONFIG, "orderMap=?", "id=?", [JSON.stringify(map), row.playlistConfigId]).then(doTheDispatch);
                    } else {
                        doTheDispatch();
                    }
                }).catch(() => {
                    console.warn("Setting order map failed: the row in Queue is missing");
                    reject();
                });
            } else {
                console.warn("Parameter 'map' is not an array");
                reject();
            }
        });
    },
    setDynamicSound: async (value, dispatch) => {
        return db.update(TABLES.QUEUE, "dynamic=?", "id=?", [value, 1]).then(async () => {
            dispatch(toggledDynamicSound(value));

            if(value) Toast.show("Volumul dinamic a fost activat!");
            else Toast.show("Volumul dinamic a fost dezactivat!");
        });
    },
    ConfigBridge: {
        setLooping: async (value, currentConfigId, dispatch) => {
            if(currentConfigId != -1) {
                await db.update(TABLES.PLAYLIST_CONFIG, "isLooping=?", "id=?", [value, currentConfigId]);
                dispatch(setBoolean({value, optionName: "LOOP"}));
    
                if(value) Toast.show("Mod 'buclă' activat");
                else Toast.show("Mod 'buclă' dezactivat");
            } else {
                console.warn("setLooping warning: There is currently no playlist loaded in the player");
            }
        }
    }
};

export const AppSettingsBridge = {
    applySetting: async (name, value, dispatch) => {
        await db.update(TABLES.SETTINGS, "value=?", "name=?", [value, name]);
        dispatch(settingApplied({name, value}));
    }
}