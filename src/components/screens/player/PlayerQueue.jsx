import React, { useState, useCallback } from 'react'
import { Box, VStack, HStack, Factory, Pressable} from 'native-base'

import { useDispatch, useSelector } from 'react-redux'

import Toast from 'react-native-root-toast';
import { Entypo, FontAwesome5, AntDesign } from '@expo/vector-icons'
import DraggableFlatList from 'react-native-draggable-flatlist'
import TrackPlayer, { Event, State, usePlaybackState, useTrackPlayerEvents } from 'react-native-track-player';

import PlayerQueueElement from './PlayerQueueElement';
import NoContentInfo from '../../general/NoContentInfo';
import LoadingPage from '../loading/LoadingPage';

import { PlaylistBridge, QueueBridge, TrackBridge } from '../../../database/componentBridge';
import { find } from '../../../functions';
import { loopBack, updateQueueOrder } from '../../../sound/orderPanel/playFunctions';
import { skipTo } from '../../../sound/orderPanel/playFunctions';
import { useMemo } from 'react';


const EntypoNB = Factory(Entypo);
const FontAwesomeNB = Factory(FontAwesome5);
const AntDesignNB = Factory(AntDesign);

const PlayerQueue = ({
    handlePlayerExpansion
}) => {
    const dispatch = useDispatch();

    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);

    const queue = useSelector(state => state.queue);
    const currentConfig = useSelector(state => state.playlistConfig);
    const playbackState = usePlaybackState();
    
    const [isChangingOrder, toggleOrderChanging] = useState(false);

    useTrackPlayerEvents([Event.PlaybackQueueEnded, Event.PlaybackTrackChanged], async event => {
        if(event.type == Event.PlaybackQueueEnded) {
            if(currentConfig.isLooping) 
                await loopBack(dispatch, tracks);
        } else if(event.type == Event.PlaybackTrackChanged) {
            const track = await TrackPlayer.getTrack(event.nextTrack);
            await PlaylistBridge.History.add(track.id, dispatch);
        }
    });

    const currentIsFavorite = useMemo(() => {
        const track = find(tracks, "id", queue.orderMap[queue.currentIndex], {favorite: false});
        return track.favorite;
    }, [tracks, queue.orderMap, queue.currentIndex]);

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
    }, [tracks, artists]);

    const updateOrder = useCallback(async ({ data, from, to }) => {
        if (
            to <= queue.currentIndex
            || (to == 0 && to == queue.currentIndex)
        ) {
            Toast.show("Nu poti muta o piesă inaintea piesei curente!", {
                duration: Toast.durations.LONG
            });
        } else if(from != to) {
            toggleOrderChanging(true);

            await QueueBridge.setOrderMap(data, dispatch);
            const millisBeforeUpdate = queue.currentMillis;
            const isPlaying = playbackState == State.Playing;

            await updateQueueOrder(tracks, data, queue.currentIndex, millisBeforeUpdate, isPlaying, dispatch);
            toggleOrderChanging(false);
        }
    }, [queue.currentIndex, queue.currentMillis]);

    const handlePlayPause = useCallback(async () => {
        const queue = await TrackPlayer.getQueue();

        if(queue.length > 0) {
            if(playbackState != State.Playing) await TrackPlayer.play();
            else await TrackPlayer.pause();
        }
    }, [playbackState]);

    const handleStepBackward = useCallback(async () => {
        if(queue.currentIndex == 0) return;
        const wasPlaying = playbackState == State.Playing;
        await skipTo(queue.currentIndex - 1, dispatch, wasPlaying);
    }, [queue.currentIndex, playbackState]);

    const handleStepForward = useCallback(async () => {
        if(queue.currentIndex == (queue.orderMap.length - 1)) return;
        const wasPlaying = playbackState == State.Playing;
        await skipTo(queue.currentIndex + 1, dispatch, wasPlaying);
    }, [queue.currentIndex, playbackState]);

    const handleFavoriteButton = useCallback(async () => {
        await TrackBridge.toggleFavorite(queue.orderMap[queue.currentIndex], dispatch);
    }, [queue.orderMap, queue.currentIndex]);

    const handleLoopButton = useCallback(() => {
        QueueBridge.ConfigBridge.setLooping(!currentConfig.isLooping, queue.playlistConfigId, dispatch);
    }, [queue.playlistConfigId, currentConfig.isLooping]);

    return (
        <VStack h="100%" mt="2" alignItems="center">
            <HStack w="90%" h="10" mb="0.5"
                alignItems="center"
                bg="gray.600"
                borderTopLeftRadius="lg"
                borderTopRightRadius="lg"
            >
                <MusicPlayerButton
                    onPress={handleStepBackward}
                    VectorIcon={AntDesignNB}
                    name="stepbackward"
                    color={queue.currentIndex > 0 ? "primary.50" : "primary.300"}
                    toastMessage="Sari înapoi"/>

                <Box w="0.5" h="100%" bg="gray.800"/>

                <PlayPauseButton
                    onPress={handlePlayPause}
                    color="primary.50"/>

                <Box w="0.5" h="100%" bg="gray.800" />

                <MusicPlayerButton
                    onPress={handleStepForward}
                    VectorIcon={AntDesignNB}
                    name="stepforward"
                    color={queue.currentIndex < (queue.orderMap.length - 1) ? "primary.50" : "primary.300"}
                    toastMessage="Sari înainte"/>
            </HStack>
            
            <HStack w="90%" h="8"
                alignItems="center"
                bg="gray.700"
                borderBottomLeftRadius="lg"
                borderBottomRightRadius="lg"
            >
                <MusicPlayerButton
                    onPress={handleLoopButton}
                    VectorIcon={EntypoNB}
                    name="loop"
                    color={currentConfig.isLooping ? "primary.50" : "primary.400"}
                    toastMessage="Redă în buclă"/>

                <Box w="0.5" h="100%" bg="gray.800"/>

                <MusicPlayerButton
                    VectorIcon={EntypoNB}
                    name="shuffle"
                    color="primary.50"
                    toastMessage="Amestecă"/>

                <Box w="0.5" h="100%" bg="gray.800" />

                <MusicPlayerButton
                    VectorIcon={FontAwesomeNB}
                    name="angle-double-left"
                    color="primary.50"
                    toastMessage="Redă invers"/>
                
                <Box w="0.5" h="100%" bg="gray.800" />

                <MusicPlayerButton
                    onPress={handleFavoriteButton}
                    VectorIcon={AntDesignNB}
                    name={currentIsFavorite ? "heart" : "hearto"}
                    color="primary.50"
                    fontSize="xl"
                    toastMessage="Favorit"/>
            </HStack>

            <Box w="90%" h="32%" mt="4">
                {
                    isChangingOrder ? (
                        <Box w="100%" h="100%" position="absolute" zIndex={100}>
                            <LoadingPage background="gray.800"/>
                        </Box>
                    ) : <></>
                }

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

const MusicPlayerButton = ({ VectorIcon, name, color, toastMessage, onPress, fontSize="2xl" }) => {
    const handleToast = useCallback(() => Toast.show(toastMessage), [toastMessage]);

    return (
        <Pressable flexGrow="1"
            onPress={onPress}
            onLongPress={handleToast}
            alignItems="center"
            _pressed={{ opacity: 0.5 }}
        >
            <VectorIcon name={name} color={color} fontSize={fontSize} />
        </Pressable>
    )
}

const PlayPauseButton = ({ color, onPress }) => {
    const playbackState = usePlaybackState();
    const handleToast = useCallback(() => Toast.show("Redă"), []);

    return (
        <Pressable flexGrow="1"
            onPress={onPress}
            onLongPress={handleToast}
            alignItems="center"
            _pressed={{ opacity: 0.5 }}
        >
            {
                playbackState == State.Playing ? (
                    <EntypoNB name="controller-paus" color={color} fontSize="2xl" />
                ) : (
                    <AntDesignNB name="caretright" color={color} fontSize="2xl" />
                )
            }
        </Pressable>
    )
}


export default PlayerQueue