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
        trackSet(state, action) {
            const data = action.payload;

            return state.map(el => {
                if (el.id == data.id) return data;
                else return el;
            });
        },
        trackAdded(state, action) {
            const val = action.payload;
            state.push(val);
            return state;
        },
        trackRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.id !== val.id);
        }
    }
});


export const { tracksSet, trackSet, trackAdded, trackRemoved } = trackSlice.actions
export default trackReducer = trackSlice.reducer