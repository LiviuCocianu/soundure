import { configureStore } from '@reduxjs/toolkit'
import { 
    playlistReducer,
    playlistContentReducer,
    playlistConfigReducer,
    trackReducer,
    artistReducer,
    queueReducer,
} from "../redux/reducers"


const store = configureStore({
    reducer: {
        playlists: playlistReducer,
        playlistsContent: playlistContentReducer, // This state maps the relations between playlists and tracks
        playlistConfig: playlistConfigReducer,
        tracks: trackReducer,
        artists: artistReducer,
        queue: queueReducer,
    }
});


export default store