import db from "./database"

import { playlistsSet } from '../redux/slices/playlistSlice'
import { tracksSet } from "../redux/slices/trackSlice"
import { playlistsContentSet } from "../redux/slices/playlistContentSlice"


export function setup(dispatch, setLoadedDatabase) {
  db.init().then(() => {
    db.existsIn("Playlist", "title = ?", ["_HISTORY"]).then(exists => {
      if (!exists) {
        db.insertInto("Playlist", { title: "_HISTORY" });
      }
    });

    db.selectFrom("Track").then(rows => dispatch(tracksSet(rows)));
    db.selectFrom("Playlist").then(rows => dispatch(playlistsSet(rows)));
    db.selectFrom("PlaylistContent").then(rows => dispatch(playlistsContentSet(rows)))
  }).then(() => setLoadedDatabase(true));
}