import { createSlice } from "@reduxjs/toolkit"


const initialState = [];

const trackSlice = createSlice({
    name: "tracks",
    initialState,
    reducers: {
        tracksSet(state, action) {
            const data = action.payload;
            return data;
        },
        trackAdded(state, action) {
            const val = action.payload;
            state.push(val);
        },
        trackRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.id !== val.id);
        }
    }
});


export const { tracksSet, trackAdded, trackRemoved } = trackSlice.actions
export default trackReducer = trackSlice.reducer