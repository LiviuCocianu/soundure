import Database from './database/database'
import { playlistsSet } from './redux/slices/playlistSlice'
import { tracksSet } from "./redux/slices/trackSlice"
import { playlistsContentSet } from "./redux/slices/playlistContentSlice"


const database = new Database();

export function setup(dispatch, setLoadedDatabase) {
    database.init().then(() => {
        database.existsIn("Playlist", "title = ?", ["_HISTORY"]).then(exists => {
          if(!exists) {
            database.insertInto("Playlist", {title: "_HISTORY"});
          }
        });
    
        database.selectFrom("Track").then(rows => dispatch(tracksSet(rows)));
        database.selectFrom("Playlist").then(rows => dispatch(playlistsSet(rows)));
        database.selectFrom("PlaylistContent").then(rows => dispatch(playlistsContentSet(rows)))
      }).then(() => setLoadedDatabase(true));
}

export default database