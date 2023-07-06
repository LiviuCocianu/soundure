import { createSlice } from "@reduxjs/toolkit";
import { APP_SETTINGS } from "../../constants";

const initialState = {
    dynamicMinVolume: APP_SETTINGS.DYNAMIC_MIN_VOLUME,
    dynamicMaxVolume: APP_SETTINGS.DYNAMIC_MAX_VOLUME,
    dynamicSensitivity: APP_SETTINGS.DYNAMIC_SENSITIVITY
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
        },
        appSettingsReset(state, action) {
            return initialState;
        }
    }
});


export const {
    settingApplied,
    appSettingsReset
} = appSettingsSlice.actions;

export default appSettingsReducer = appSettingsSlice.reducer;