import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    currentIndex: 0,
    currentMillis: 0,
    playlistConfigId: -1,
    orderMap: [],
    synced: false,
};

const queueSlice = createSlice({
    name: "queue",
    initialState,
    reducers: {
        currentIndexSet(state, action) {
            state.currentIndex = action.payload;
            return state;
        },
        currentMillisSet(state, action) {
            state.currentMillis = action.payload;
            return state;
        },
        currentConfigSet(state, action) {
            state.playlistConfigId = action.payload;
            return state;
        },
        orderMapSet(state, action) {
            const val = action.payload;
            state.orderMap = val;
            return state;
        },
        orderMapTrackSet(state, action) {
            const {val, at} = action.payload;
            state.orderMap[at] = val;
            return state;
        },
        orderMapTrackAdded(state, action) {
            const val = action.payload;
            state.orderMap.push(val);
            return state;
        },
        orderMapTrackRemoved(state, action) {
            const val = action.payload;
            return state.orderMap.filter(el => el.id !== val.id);
        },
        syncedWithDatabase(state, action) {
            state.synced = action.payload;
            return state;
        }
    }
});


export const {
    currentIndexSet,
    currentMillisSet,
    currentConfigSet,
    orderMapSet,
    orderMapTrackSet,
    orderMapTrackAdded,
    orderMapTrackRemoved,
    syncedWithDatabase
} = queueSlice.actions;

export default queueReducer = queueSlice.reducer