import { appSettingsReset } from "./slices/appSettingsSlice";
import { artistsReset } from "./slices/artistSlice";
import { playlistConfigReset } from "./slices/playlistConfigSlice";
import { playlistContentReset } from "./slices/playlistContentSlice";
import { playlistReset } from "./slices/playlistSlice";
import { queueReset } from "./slices/queueSlice";
import { tracksReset } from "./slices/trackSlice";


export const resetReduxState = (dispatch) => {
    dispatch(appSettingsReset());
    dispatch(artistsReset());
    dispatch(playlistConfigReset());
    dispatch(playlistContentReset());
    dispatch(playlistReset());
    dispatch(queueReset());
    dispatch(tracksReset());
}