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
        playlistSet(state, action) {
            const data = action.payload;

            return state.map(el => {
                if(el.id == data.id) return data;
                else return el;
            });
        },
        playlistAdded(state, action) {
            const val = action.payload;
            state.push(val);
            return state;
        },
        playlistRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.id !== val.id);
        },
        playlistReset(state, action) {
            state = [];
            return state;
        }
    }
});


export const { 
    playlistsSet, 
    playlistSet, 
    playlistAdded, 
    playlistRemoved,
    playlistReset
} = playlistSlice.actions
export default playlistReducer = playlistSlice.reducer