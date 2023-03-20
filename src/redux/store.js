import { configureStore } from '@reduxjs/toolkit'
import { 
    playlistReducer,
    playlistContentReducer,
    trackReducer,
    artistReducer
} from "../redux/reducers"


const store = configureStore({
    reducer: {
        playlists: playlistReducer,
        playlistsContent: playlistContentReducer, // This state maps the relations between playlists and tracks
        tracks: trackReducer,
        artists: artistReducer,
    }
});


export default store