import TrackPlayer from "react-native-track-player";
import { TABLES } from "../../constants";
import { PlaylistBridge, QueueBridge } from "../../database/componentBridge"
import db from "../../database/database";
import { wrap } from "../trackBridge";


export const play = async (playlistId, dispatch) => {
    const row = await PlaylistBridge.getConfig(playlistId);
    const parsedMap = JSON.parse(row.orderMap);

    await QueueBridge.setCurrentConfig(row.id, dispatch);
    await QueueBridge.setOrderMap(parsedMap, dispatch, false);

    await TrackPlayer.reset();

    const orderMapTracks = await db.selectFrom(TABLES.TRACK, null, `id IN (${parsedMap.join(", ")})`);
    
    for(const track of orderMapTracks) {
        const wrapped = await wrap(track);
        await TrackPlayer.add(wrapped);
    }

    await TrackPlayer.play();
}