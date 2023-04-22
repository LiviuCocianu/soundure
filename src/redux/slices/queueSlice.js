import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    currentIndex: 0,
    currentMillis: 0,
    orderMap: []
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
        }
    }
});


export const {
    currentIndexSet,
    currentMillisSet,
    orderMapSet,
    orderMapTrackSet,
    orderMapTrackAdded,
    orderMapTrackRemoved,
} = queueSlice.actions;

export default queueReducer = queueSlice.reducer