import db from "./database"

import { playlistsSet } from '../redux/slices/playlistSlice'
import { tracksSet } from "../redux/slices/trackSlice"
import { playlistsContentSet } from "../redux/slices/playlistContentSlice"
import { artistsSet } from "../redux/slices/artistSlice"


export function setup(dispatch, setLoadedDatabase) {
  db.init().then(async () => {
    await db.existsIn("Playlist", "title = ?", ["_HISTORY"]).then(exists => {
      if (!exists) {
        db.insertInto("Playlist", { title: "_HISTORY" });
      }
    });

    await db.selectFrom("Track").then(rows => {
      dispatch(tracksSet(rows));
    });

    await db.selectFrom("Artist").then(rows => {
      dispatch(artistsSet(rows));
    });
    
    await db.selectFrom("Playlist").then(rows => dispatch(playlistsSet(rows)));
    await db.selectFrom("PlaylistContent").then(rows => dispatch(playlistsContentSet(rows)))
  }).then(() => setLoadedDatabase(true));
}