import { PlaylistBridge, QueueBridge } from "../../../../database/componentBridge"


export const play = async (playlistId, dispatch) => {
    const row = await PlaylistBridge.getConfig(playlistId);

    QueueBridge.setCurrentConfig(row.id, dispatch).then(() => {
        QueueBridge.setOrderMap(JSON.parse(row.orderMap), dispatch, false)
            .then(() => {
                
            });
    });
}