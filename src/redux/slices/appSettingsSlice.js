import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    dynamicMinVolume: 0.2,
    dynamicMaxVolume: 0.8,
    dynamicSensitivity: 40000
}

const appSettingsSlice = createSlice({
    name: "appSettings",
    initialState,
    reducers: {
        /**
         * Apply a setting for the application
         * 
         * @param {object} action
         * @param {object} action.payload
         * @param {string} action.payload.value Value to set
         * @param {'dynamicMinVolume'|'dynamicMaxVolume'|'dynamicSensitivity'} [action.payload.name] Option to toggle. Default is dynamicMinVolume
         */
        settingApplied(state, action) {
            const {
                value,
                name="dynamicMinVolume"
            } = action.payload;

            switch(name) {
                case "dynamicMinVolume":
                    state.dynamicMinVolume = parseFloat(value);
                    break;
                case "dynamicMaxVolume":
                    state.dynamicMaxVolume = parseFloat(value);
                    break;
                case "dynamicSensitivity":
                    state.dynamicSensitivity = parseInt(value);
                    break;
            }

            return state;
        }
    }
});


export const {
    settingApplied,
} = appSettingsSlice.actions;

export default appSettingsReducer = appSettingsSlice.reducer;