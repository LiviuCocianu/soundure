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
            const val = action.payload;
            state.push(val);
        },
        playlistRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.id !== val.id);
        }
    }
});


export const { playlistsSet, playlistAdded, playlistRemoved } = playlistSlice.actions
export default playlistReducer = playlistSlice.reducer