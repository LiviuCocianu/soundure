import React, { useMemo, useCallback } from 'react'
import { Box } from 'native-base'

import { useDispatch, useSelector } from 'react-redux'

import DraggableFlatList from 'react-native-draggable-flatlist'
import PlayerQueueElement from './PlayerQueueElement';

import { QueueBridge } from '../../../database/componentBridge';


const PlayerQueue = () => {
    const dispatch = useDispatch();

    const tracks = useSelector(state => state.tracks);
    const orderMap = useSelector(state => state.queue.orderMap);
    const ownTracks = useMemo(() => tracks.filter(tr => orderMap.includes(tr.id)), [tracks, orderMap])

    const renderCallback = useCallback(({item, drag, isActive}) => {
        return (
            <PlayerQueueElement
                trackId={item.id}
                drag={drag}
                isActive={isActive} />
        )
    }, [ownTracks]);

    const updateOrder = ({data}) => {
        QueueBridge.setOrderMap(data.map(tr => tr.id), dispatch);
    }

    return (
        <Box w="90%" h="32%" mt="4">
            <DraggableFlatList
                data={ownTracks}
                renderItem={renderCallback}
                keyExtractor={(_, index) => `queuelistitem_${index}`}
                onDragEnd={updateOrder}
                showsVerticalScrollIndicator={false}
                style={{ width: "100%", height: "100%" }}/>
        </Box>
    )
}


export default PlayerQueue