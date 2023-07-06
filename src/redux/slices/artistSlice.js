import { createSlice } from "@reduxjs/toolkit"


const initialState = [];

const artistSlice = createSlice({
    name: "artists",
    initialState,
    reducers: {
        artistsSet(state, action) {
            const data = action.payload;
            return data;
        },
        artistAdded(state, action) {
            const val = action.payload;
            state.push(val);
        },
        artistRemoved(state, action) {
            const val = action.payload;
            return state.filter(el => el.id !== val.id);
        },
        artistsReset(state, action) {
            return initialState;
        }
    }
});


export const { 
    artistsSet, 
    artistAdded, 
    artistRemoved, 
    artistsReset 
} = artistSlice.actions
export default artistReducer = artistSlice.reducer