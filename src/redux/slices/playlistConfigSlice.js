import { createSlice } from "@reduxjs/toolkit";
import { ORDER_MUTATION_OPTIONS } from "../../constants";

const initialState = {
    historyOrder: [],
    isLooping: false,
    isShuffling: false,
    isReversing: false
}

const playlistConfigSlice = createSlice({
    name: "playlistConfig",
    initialState,
    reducers: {
        /**
         * Toggle one of the playlist config options
         * 
         * @param {object} action
         * @param {object} action.payload
         * @param {boolean} action.payload.value Boolean value to set
         * @param {'LOOP'|'SHUFFLE'|'REVERSE'} [action.payload.optionName] Option to toggle. Default is LOOP
         */
        setBoolean(state, action) {
            const {
                value,
                optionName=ORDER_MUTATION_OPTIONS.LOOP
            } = action.payload;

            switch(optionName) {
                case ORDER_MUTATION_OPTIONS.LOOP:
                    state.isLooping = value;
                    break;
                case ORDER_MUTATION_OPTIONS.SHUFFLE:
                    state.isShuffling = value;
                    break;
                case ORDER_MUTATION_OPTIONS.REVERSE :
                    state.isReversing = value;
                    break;
            }

            return state;
        },
        historyOrderSet(state, action) {
            const data = action.payload;
            state.historyOrder = data;
            return state;
        },
    }
});


export const {
    setBoolean,
    historyOrderSet
} = playlistConfigSlice.actions;

export default playlistConfigReducer = playlistConfigSlice.reducer;