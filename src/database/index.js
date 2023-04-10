import db from "./database"

import { playlistsSet } from '../redux/slices/playlistSlice'
import { tracksSet } from "../redux/slices/trackSlice"
import { playlistsContentSet } from "../redux/slices/playlistContentSlice"
import { artistsSet } from "../redux/slices/artistSlice"
import { TABLES } from "../constants"


export function setupDatabase(dispatch, setLoadedDatabase) {
    db.init().then(async () => {
        await db.existsIn(TABLES.PLAYLIST, "title = ?", ["_HISTORY"]).then(exists => {
            if (!exists) db.insertInto(TABLES.PLAYLIST, { title: "_HISTORY" });
        });

        await db.existsIn(TABLES.QUOTE, "id=?", [1]).then(exists => {
            if (!exists) db.insertInto(TABLES.QUOTE, { lastFetch: 0 });
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

        await db.selectFrom(TABLES.PLAYLIST_CONTENT).then(rows => dispatch(playlistsContentSet(rows)))
    }).then(() => setLoadedDatabase(true));
}