import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Box, VStack, HStack, Factory, Pressable} from 'native-base'

import { useDispatch, useSelector } from 'react-redux'

import Toast from 'react-native-root-toast';
import { Entypo, FontAwesome5 } from '@expo/vector-icons'
import DraggableFlatList from 'react-native-draggable-flatlist'

import PlayerQueueElement from './PlayerQueueElement';

import { QueueBridge } from '../../../database/componentBridge';
import { find } from '../../../functions';
import NoContentInfo from '../../general/NoContentInfo';
import TrackPlayer, { Event, RepeatMode, useTrackPlayerEvents } from 'react-native-track-player';
import { loopBack, play } from '../../../sound/orderPanel/playFunctions';


const EntypoNB = Factory(Entypo);
const FontAwesomeNB = Factory(FontAwesome5);

const PlayerQueue = ({
    handlePlayerExpansion
}) => {
    const dispatch = useDispatch();

    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);

    const currentIndex = useSelector(state => state.queue.currentIndex);
    const orderMap = useSelector(state => state.queue.orderMap);

    const [isLooping, toggleLoop] = useState(false);

    const findTrackInfo = useCallback((trackId) => {
        const track = find(tracks, "id", trackId);
        const artist = find(artists, "id", track.artistId);

        return [track, artist];
    }, [tracks, artists]);

    useTrackPlayerEvents([Event.PlaybackQueueEnded], async () => {
        if(isLooping) {
            await loopBack(dispatch);
        }
    });

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

    const updateOrder = useCallback(({ data, from, to }) => {
        if (
            from <= currentIndex 
            || to < currentIndex
            || (to == 0 && to == currentIndex)
        ) {
            if (from <= currentIndex) {
                Toast.show("Nu poti muta o piesă care precede piesa curentă!", {
                    duration: Toast.durations.LONG
                });
            } else if (to < currentIndex || (to == 0 && to == currentIndex)) {
                Toast.show("Nu poti muta o piesă inaintea piesei curente!", {
                    duration: Toast.durations.LONG
                });
            }
            return;
        }

        QueueBridge.setOrderMap(data, dispatch);
    }, [currentIndex]);

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
                    orderMap.length > 0 ? (
                        <DraggableFlatList
                            data={orderMap}
                            renderItem={renderCallback}
                            keyExtractor={(_, index) => `queuelistitem_${index}`}
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