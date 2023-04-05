import db from "./database";
import { ENV, QUOTE_API_URL, TABLES } from "../constants";
import Toast from "react-native-root-toast";

import { trackSet, trackAdded, trackRemoved } from "../redux/slices/trackSlice";
import { playlistAdded, playlistRemoved } from "../redux/slices/playlistSlice";
import { trackRelationsRemoved, playlistRelationsRemoved, trackPlaylistRelationRemoved } from "../redux/slices/playlistContentSlice";
import { artistAdded } from "../redux/slices/artistSlice";


export const TrackUtils = {
    updateColumn: (columnName, value, trackId, dispatch) => {
        db.selectFrom(TABLES.TRACK, null, "id=?", [trackId]).then(rows => {
            const track = rows[0];
    
            db.update(TABLES.TRACK, `${columnName}=?`, "id=?", [value, track.id]).then(() => {
                const obj = {
                    ...track,
                    [`${columnName}`]: value
                };
                dispatch(trackSet(obj));
            });
        });
    },
    toggleFavorite: (trackId, dispatch) => {
        db.selectFrom(TABLES.TRACK, null, "id=?", [trackId]).then(rows => {
            const track = rows[0];
            TrackUtils.updateColumn("favorite", !track.favorite, trackId, dispatch);
    
            if(!track.favorite) {
                Toast.show("Piesă adaugată la favorite!");
            } else {
                Toast.show("Piesă eliminată de la favorite!");
            }
        });
    },
    setTitle: (title, trackId, dispatch) => {
        TrackUtils.updateColumn("title", title, trackId, dispatch);
        Toast.show("Titlul a fost actualizat!");
    },
    setCoverURI: (coverURI, trackId, dispatch) => {
        TrackUtils.updateColumn("coverURI", JSON.stringify({ uri: coverURI }), trackId, dispatch);
        Toast.show("Coperta a fost actualizată!");
    },
    addTrack: (payload, dispatch) => {
        const {artist, track} = payload;

        db.insertIfNotExists(TABLES.ARTIST, { name: artist }, "name = ?", [artist]).then(() => {
            db.selectFrom(TABLES.ARTIST, null, "name = ?", [artist]).then(rows => {
                const artist = rows[0];
                let toInsert = { artistId: artist.id, ...track };

                dispatch(artistAdded(artist));

                db.insertInto(TABLES.TRACK, toInsert).then(rs => {
                    const payload = { id: rs.insertId, ...toInsert };
                    dispatch(trackAdded(payload));
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

export const PlaylistUtils = {
    addPlaylist: (payload, dispatch) => {
        db.insertInto(TABLES.PLAYLIST, payload).then(rs => {
            const completePayload = {id: rs.insertId, ...payload};
            dispatch(playlistAdded(completePayload));

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
    }
}

export const QuoteUtils = {
    canFetchQuote: async () => {
        return db.selectFrom(TABLES.QUOTE).then(rows => {
            const row = rows[0];
            const currentMillis = new Date().getTime();
            const canFetch = (currentMillis - row.lastFetch) > (1000 * 60 * 60 * 24);

            return canFetch;
        });
    },
    fetchQuote: async () => {
        return QuoteUtils.canFetchQuote().then(async fetches => {
            if (fetches) {
                return await fetch(QUOTE_API_URL, {
                        headers: {
                            "X-Api-Key": ENV.QUOTE_API_KEY
                        }
                    })
                    .then(res => res.json())
                    .then(res => {
                        const quote = res[0].quote > 75 ?
                            quote.slice(0, 70) + "..." :
                            res[0].quote;

                        const author = res[0].author;

                        const lastFetch = new Date().getTime();
                        db.update(TABLES.QUOTE, "lastFetch=?, quote=?, author=?", "id=?", [lastFetch, quote, author, 1]);

                        return { quote, author };
                    });
            } else {
                return db.selectFrom(TABLES.QUOTE, ["quote", "author"], "id=?", [1]).then(rows => {
                    const {quote, author} = rows[0];
                    return { quote, author };
                });
            }
        });
    },
    updatesDaily: async () => {
        return db.selectFrom(TABLES.QUOTE, ["updateDaily"]).then(rows => {
            const row = rows[0];
            return row.updateDaily;
        });
    },
    toggleDailyUpdate: () => {
        QuoteUtils.updatesDaily().then(updates => {
            db.update(TABLES.QUOTE, "updateDaily=?", "id=?", [!updates, 1]);

            if(updates) Toast.show("Ai dezactivat citatele zilnice!");
            else Toast.show("Ai activat citatele zilnice!");
        })
    }
}