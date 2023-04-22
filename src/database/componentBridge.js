import { Dispatch, AnyAction } from "redux";

import db from "./database";
import { ARTIST_NAME_PLACEHOLDER, ENV, ORDER_MUTATION_OPTIONS, PLATFORMS, QUOTE_API_URL, TABLES } from "../constants";
import Toast from "react-native-root-toast";

import { trackSet, trackAdded, trackRemoved } from "../redux/slices/trackSlice";
import { playlistAdded, playlistRemoved, playlistSet } from "../redux/slices/playlistSlice";
import { trackRelationsRemoved, playlistRelationsRemoved, trackPlaylistRelationRemoved, playlistContentAdded } from "../redux/slices/playlistContentSlice";
import { artistAdded } from "../redux/slices/artistSlice";
import { currentIndexSet, currentMillisSet, orderMapSet } from "../redux/slices/queueSlice";


const updateColumn = (table, id, setAction, { column, value, dispatch }) => {
    db.selectFrom(table, null, "id=?", [id]).then(rows => {
        db.update(table, `${column}=?`, "id=?", [value, id]).then(() => {
            dispatch(setAction({ ...rows[0], [`${column}`]: value }));
        });
    });
};

const getFixedRow = async (table) => {
    return db.selectFrom(table, null, "id=?", [1]).then(rows => rows[0]);
};


export const TrackBridge = {
    updateColumn: (column, value, trackId, dispatch) => {
        updateColumn(TABLES.TRACK, trackId, trackSet, {
            column, value, dispatch
        });
    },
    toggleFavorite: (trackId, dispatch) => {
        db.selectFrom(TABLES.TRACK, null, "id=?", [trackId]).then(rows => {
            const track = rows[0];
            TrackBridge.updateColumn("favorite", !track.favorite, trackId, dispatch);
    
            if(!track.favorite) {
                Toast.show("Piesă adaugată la favorite!");
            } else {
                Toast.show("Piesă eliminată de la favorite!");
            }
        });
    },
    setTitle: (title, trackId, dispatch) => {
        TrackBridge.updateColumn("title", title, trackId, dispatch);
        Toast.show("Titlul a fost actualizat!");
    },
    setCoverURI: (coverURI, trackId, dispatch) => {
        TrackBridge.updateColumn("coverURI", JSON.stringify({ uri: coverURI }), trackId, dispatch);
        Toast.show("Coperta a fost actualizată!");
    },
    /**
     * Adds track to database and redux store
     * @param {{track: {title: string, fileURI: string, platform: string|undefined, millis: number|undefined}, artist: string|undefined}} payload 
     * @param {Dispatch<AnyAction>} dispatch 
     * @param {boolean} [redux=true] If track should be added to the Redux store as well
     */
    addTrack: async (payload, dispatch, redux=true) => {
        const {artist=ARTIST_NAME_PLACEHOLDER, track} = payload;

        return db.insertIfNotExists(TABLES.ARTIST, { name: artist }, "name = ?", [artist]).then(() => {
            db.selectFrom(TABLES.ARTIST, null, "name = ?", [artist]).then(rows => {
                const {
                    title,
                    fileURI,
                    platform=PLATFORMS.NONE,
                    millis=0
                } = track;

                const artist = rows[0];

                let toInsert = { title, fileURI, platform, millis, artistId: artist.id };

                if (redux) dispatch(artistAdded(artist));

                db.insertInto(TABLES.TRACK, toInsert).then(rs => {
                    const payload = { id: rs.insertId, ...toInsert };
                    if (redux) dispatch(trackAdded(payload));
                });
            });
        });
    },
    deleteTrack: (trackId, dispatch) => {
        db.deleteFrom(TABLES.PLAYLIST_CONTENT, "trackId=?", [trackId]).then(() => {
            dispatch(trackRelationsRemoved({ trackId }));

            db.deleteFrom(TABLES.TRACK, "id=?", [trackId]).then(() => {
                dispatch(trackRemoved({ id: trackId }));
                Toast.show("Piesă eliminată!");
            });
        });
    },
    trackExists: (fileURI) => {
        return db.existsIn(TABLES.TRACK, "fileURI = ?", [fileURI]);
    },
    deleteFromPlaylist: (playlistId, trackId, dispatch) => {
        db.deleteFrom(TABLES.PLAYLIST_CONTENT, "trackId=? AND playlistId=?", [trackId, playlistId]).then(() => {
            dispatch(trackPlaylistRelationRemoved({ playlistId, trackId }));
            Toast.show("Piesă eliminată din playlist!");
        });
    }
}

export const PlaylistBridge = {
    updateColumn: (column, value, playlistId, dispatch) => {
        updateColumn(TABLES.PLAYLIST, playlistId, playlistSet, {
            column, value, dispatch
        });
    },
    setTitle: (title, playlistId, dispatch) => {
        PlaylistBridge.updateColumn("title", title, playlistId, dispatch);
        Toast.show("Titlul a fost actualizat!");
    },
    setCoverURI: (coverURI, playlistId, dispatch) => {
        PlaylistBridge.updateColumn("coverURI", JSON.stringify({ uri: coverURI }), playlistId, dispatch);
        Toast.show("Coperta a fost actualizată!");
    },
    /**
     * Adds playlist to database and redux store
     * @param {{title: string, description: string|undefined, coverURI: string}} payload 
     * @param {Dispatch<AnyAction>} dispatch
     * @param {boolean} [redux=true] If playlist should be added to the Redux store as well
     */
    addPlaylist: async (payload, dispatch, redux=true) => {
        db.insertInto(TABLES.PLAYLIST, payload).then(rs => {
            const completePayload = {id: rs.insertId, ...payload};
            if (redux) dispatch(playlistAdded(completePayload));

            Toast.show("Playlist creat!");
        });
    },
    deletePlaylist: (playlistId, dispatch) => {
        db.deleteFrom(TABLES.PLAYLIST_CONTENT, "playlistId = ?", [playlistId]).then(() => {
            dispatch(playlistRelationsRemoved({ playlistId }));

            db.deleteFrom(TABLES.PLAYLIST, "id = ?", [playlistId]).then(() => {
                dispatch(playlistRemoved({ id: playlistId }));
                Toast.show("Playlist eliminat!");
            });
        });
    },
    /**
     * Establish what track belongs to what playlist
     * @param {{trackId: number, playlistId: number}[]} links 
     * @param {Dispatch<AnyAction>} dispatch 
     * @param {boolean} [redux=true] If link should be added to the Redux store as well
     */
    linkTracks: async (links, dispatch, redux=true) => {
        db.insertBulkInto(TABLES.PLAYLIST_CONTENT, links)
            .then(rsArr => {
                rsArr.forEach(rs => {
                    const payl = rs.payload;
                    if (redux) dispatch(playlistContentAdded({ id: rs.insertId, ...payl }));
                });

                Toast.show(links.length != 1 ? "Piesele au fost adăugate!" : "Piesa a fost adăugată!");
            });
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
    setIndex: (index, dispatch) => {
        getFixedRow(TABLES.QUEUE).then(row => {
            if (row.playlistConfigId || row.playlistConfigId == -1) {
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
    incrementIndex: (dispatch) => {
        getFixedRow(TABLES.QUEUE).then(row => {
            QueueBridge.setIndex(row.currentIndex + 1, dispatch);
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
    setCurrentMillis: (millis, dispatch, sendTo=["database", "redux"]) => {
        if(millis >= 0) {
            if (sendTo.includes("database") && sendTo.includes("redux"))
                db.update(TABLES.QUEUE, "currentMillis=?", "id=?", [millis, 1]).then(() => {
                    dispatch(currentMillisSet(millis));
                });
            else if (sendTo.includes("database"))
                db.update(TABLES.QUEUE, "currentMillis=?", "id=?", [millis, 1]);
            else if (sendTo.includes("redux"))
                dispatch(currentMillisSet(millis));
        }
    },
    setOrderMap: (map, dispatch) => {
        if(Array.isArray(map)) {
            getFixedRow(TABLES.QUEUE).then(row => {
                if (row.playlistConfigId || row.playlistConfigId == -1) {
                    console.warn("Couldn't set order map because destination config is not defined. Add a playlist to the queue then try again..");
                    return;
                }

                db.update(TABLES.PLAYLIST_CONFIG, "id=?, orderMap=?", "id=?", [row.playlistConfigId, JSON.stringify(map), 1]).then(() => {
                    dispatch(orderMapSet(map));
                });
            });
        }
    },
    toggleConfigOptionFor: (playlistId, dispatch, option=ORDER_MUTATION_OPTIONS.LOOP, value=false) => {

    }
};