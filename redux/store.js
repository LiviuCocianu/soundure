import { configureStore } from '@reduxjs/toolkit'
import playlistReducer from "../redux/slices/playlistSlice"

const store = configureStore({
    reducer: {
        playlists: playlistReducer
    }
});

export default store;