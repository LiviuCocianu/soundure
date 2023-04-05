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
        },
        trackRelationsRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.trackId !== val.trackId);
        },
        playlistRelationsRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.playlistId !== val.playlistId);
        },
        trackPlaylistRelationRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => ((el.playlistId !== val.playlistId) || (el.trackId !== val.trackId)));
        }
    }
});


export const { 
    playlistsContentSet,
    playlistContentAdded,
    playlistContentRemoved,
    trackRelationsRemoved,
    playlistRelationsRemoved,
    trackPlaylistRelationRemoved
} = playlistContentSlice.actions
export default playlistContentReducer = playlistContentSlice.reducer