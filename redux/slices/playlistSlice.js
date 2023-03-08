import { createSlice } from "@reduxjs/toolkit"

const initialState = [];

const playlistSlice = createSlice({
    name: "playlists",
    initialState,
    reducers: {
        playlistsSet(state, action) {
            const data = action.payload;
            return data;
        },
        playlistAdded(state, action) {
            const playlist = action.payload;
            state.push(playlist);
        },
        playlistRemoved(state, action) {
            const playlist = action.payload;
            return state.filter(el => el.id !== playlist.id);
        }
    }
});

export const { playlistsSet, playlistAdded, playlistRemoved } = playlistSlice.actions;
export default playlistReducer = playlistSlice.reducer;