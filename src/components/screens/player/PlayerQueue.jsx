import React, { useState, useEffect, useCallback } from 'react'
import { Box, VStack, HStack, Factory, Pressable} from 'native-base'

import { useDispatch, useSelector } from 'react-redux'

import Toast from 'react-native-root-toast';
import { Entypo, FontAwesome5 } from '@expo/vector-icons'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Event, useTrackPlayerEvents } from 'react-native-track-player';

import PlayerQueueElement from './PlayerQueueElement';

import { QueueBridge } from '../../../database/componentBridge';
import { find } from '../../../functions';
import NoContentInfo from '../../general/NoContentInfo';
import { loopBack, updateQueueOrder } from '../../../sound/orderPanel/playFunctions';


const EntypoNB = Factory(Entypo);
const FontAwesomeNB = Factory(FontAwesome5);

const PlayerQueue = ({
    handlePlayerExpansion
}) => {
    const dispatch = useDispatch();

    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);

    const queue = useSelector(state => state.queue);
    
    const [isLooping, toggleLoop] = useState(false);

    useTrackPlayerEvents([Event.PlaybackQueueEnded], async () => {
        if(isLooping) {
            await loopBack(dispatch);
        }
    });

    const findTrackInfo = useCallback((trackId) => {
        const track = find(tracks, "id", trackId);
        const artist = find(artists, "id", track.artistId);

        return [track, artist];
    }, [tracks, artists]);

    const renderCallback = useCallback(({item, drag, isActive}) => {
        const [track, artist] = findTrackInfo(item);

        return (
            <PlayerQueueElement
                track={track}
                artist={artist}
                drag={drag}
                isActive={isActive} />
        )
    }, [tracks, artists, findTrackInfo]);

    const updateOrder = useCallback(async ({ data, from, to }) => {
        if (
            from <= queue.currentIndex 
            || to < queue.currentIndex
            || (to == 0 && to == queue.currentIndex)
        ) {
            if (from <= queue.currentIndex) {
                Toast.show("Nu poti muta o piesă care precede piesa curentă!", {
                    duration: Toast.durations.LONG
                });
            } else if (to < queue.currentIndex || (to == 0 && to == queue.currentIndex)) {
                Toast.show("Nu poti muta o piesă inaintea piesei curente!", {
                    duration: Toast.durations.LONG
                });
            }
        } else {
            await QueueBridge.setOrderMap(data, dispatch);
            await updateQueueOrder(data, queue.currentIndex);
        }
    }, [queue.currentIndex]);

    return (
        <VStack h="100%" mt="2" alignItems="center">
            <HStack w="90%" h="8"
                alignItems="center"
                bg="gray.700"
                rounded="lg"
            >
                <OrderControlButton
                    onPress={() => toggleLoop(!isLooping)}
                    VectorIcon={EntypoNB}
                    name="loop"
                    color={isLooping ? "primary.50" : "primary.400"}
                    toastMessage="Redă în buclă"/>

                <Box w="0.5" h="100%" bg="gray.800"/>

                <OrderControlButton
                    VectorIcon={EntypoNB}
                    name="shuffle"
                    color="primary.50"
                    toastMessage="Amestecă"/>

                <Box w="0.5" h="100%" bg="gray.800" />

                <OrderControlButton
                    VectorIcon={FontAwesomeNB}
                    name="angle-double-left"
                    color="primary.50"
                    toastMessage="Redă invers"/>
            </HStack>

            <Box w="90%" h="32%" mt="4">
                {
                    queue.orderMap.length > 0 ? (
                        <DraggableFlatList
                            data={queue.orderMap}
                            renderItem={renderCallback}
                            keyExtractor={(item) => `queuelistitem_${item}`}
                            onDragEnd={updateOrder}
                            showsVerticalScrollIndicator={false}
                            style={{ width: "100%", height: "100%" }} />
                    ) : (
                        <NoContentInfo
                            onPress={handlePlayerExpansion}
                            subtitle="Navighează către un playlist și alege o opțiune de redare"/>
                    )
                }
            </Box>
        </VStack>
    )
}

const OrderControlButton = ({ VectorIcon, name, color, toastMessage, onPress }) => {
    return (
        <Pressable flexGrow="1"
            onPress={onPress}
            onLongPress={() => Toast.show(toastMessage)}
            alignItems="center"
            _pressed={{ opacity: 0.5 }}
        >
            <VectorIcon name={name} color={color} fontSize="2xl" />
        </Pressable>
    )
}


export default PlayerQueue