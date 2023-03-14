import { createSlice } from "@reduxjs/toolkit"


const initialState = [];

const playlistContentSlice = createSlice({
    name: "playlistsContent",
    initialState,
    reducers: {
        playlistsContentSet(state, action) {
            const data = action.payload;
            return data;
        },
        playlistContentAdded(state, action) {
            const val = action.payload;
            state.push(val);
        },
        playlistContentRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.id !== val.id);
        }
    }
});


export const { playlistsContentSet, playlistContentAdded, playlistContentRemoved } = playlistContentSlice.actions
export default playlistContentReducer = playlistContentSlice.reducer