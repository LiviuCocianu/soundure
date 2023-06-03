import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event
} from "react-native-track-player";
import { skipTo } from "./orderPanel/playFunctions";
import store from "../redux/store"


const serviceCallback = async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        const current = await TrackPlayer.getCurrentTrack();
        const queue = await TrackPlayer.getQueue();
        if(current == (queue.length - 1)) return
        await skipTo(current + 1, store.dispatch);
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        const current = await TrackPlayer.getCurrentTrack();
        if(current == 0) return;
        await skipTo(current - 1, store.dispatch);
    });
}

export async function setupPlayer() {
    let isSetup = false;
    try {
        await TrackPlayer.getCurrentTrack();
        isSetup = true;
    } catch {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
            progressUpdateEventInterval: 2,
        });

        isSetup = true;
    } finally {
        return isSetup;
    }
}

export default serviceCallback