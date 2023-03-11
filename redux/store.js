import { configureStore } from '@reduxjs/toolkit'
import { 
    playlistReducer,
    playlistContentReducer,
    trackReducer
} from "../redux/reducers"

const store = configureStore({
    reducer: {
        playlists: playlistReducer,
        playlistsContent: playlistContentReducer, // This state maps the relations between playlists and tracks
        tracks: trackReducer,
    }
});

export default store;