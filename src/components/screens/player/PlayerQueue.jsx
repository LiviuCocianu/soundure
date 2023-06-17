import React, { useState, useCallback } from 'react'
import { Box, VStack, HStack, Factory, Pressable} from 'native-base'

import { useDispatch, useSelector } from 'react-redux'

import Toast from 'react-native-root-toast';
import { Entypo, FontAwesome5, AntDesign, MaterialIcons } from '@expo/vector-icons'
import DraggableFlatList from 'react-native-draggable-flatlist'
import TrackPlayer, { Event, RepeatMode, State, usePlaybackState, useTrackPlayerEvents } from 'react-native-track-player';
import RNSoundLevel from 'react-native-sound-level'

import PlayerQueueElement from './PlayerQueueElement';
import NoContentInfo from '../../general/NoContentInfo';
import LoadingPage from '../loading/LoadingPage';

import { PlaylistBridge, QueueBridge, TrackBridge } from '../../../database/componentBridge';
import { find, reverse, shuffle } from '../../../functions';
import { loopBack, updateQueueOrder } from '../../../sound/orderPanel/playFunctions';
import { skipTo } from '../../../sound/orderPanel/playFunctions';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { VolumeManager } from 'react-native-volume-manager';


const EntypoNB = Factory(Entypo);
const FontAwesomeNB = Factory(FontAwesome5);
const AntDesignNB = Factory(AntDesign);
const MaterialIconsNB = Factory(MaterialIcons)

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

        } else if(event.type == Event.PlaybackTrackChanged) {
            if(event.nextTrack) {
                const track = await TrackPlayer.getTrack(event.nextTrack);
                await PlaylistBridge.History.add(track.id, dispatch);
            } else {
                if (currentConfig.isLooping)
                    await loopBack(tracks, dispatch);
            }
        }
    });

    useEffect(() => {
        (async () => {
            if (queue.orderMap.length == 0) {
                await TrackPlayer.reset();
            }
        })();
    }, [queue.orderMap]);

    useEffect(() => {
        if(queue.dynamic) RNSoundLevel.start();
        else RNSoundLevel.stop();
    }, [queue.dynamic]);

    const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    const invlerp = (x, y, a) => clamp((a - x) / (y - x));

    useEffect(() => {
        let samples = [];

        RNSoundLevel.onNewFrame = (data) => {
            if(queue.orderMap.length > 0) {
                if (samples.length < 5) {
                    samples.push(data.rawValue);
                } else {
                    const avg = samples.reduce((a, b) => a + b) / samples.length;
    
                    console.log(avg, Math.min(invlerp(200, 40000, avg) + 0.2, 0.8));
                    VolumeManager.setVolume(Math.min(invlerp(200, 40000, avg) + 0.2, 0.8));
    
                    samples = [];
                }
            }
        }

        return () => {
            RNSoundLevel.stop();
        }
    }, [queue.orderMap]);

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
    }, [tracks, queue.currentIndex, queue.currentMillis]);

    const handlePlayPause = useCallback(async () => {
        const playerQueue = await TrackPlayer.getQueue();

        if (playerQueue.length > 0) {
            if(playbackState != State.Playing) {
                const currentTrack = find(tracks, "id", queue.orderMap[queue.currentIndex]);

                if (queue.currentMillis >= currentTrack.millis) 
                    await TrackPlayer.seekTo(0);

                await TrackPlayer.play();
            } else await TrackPlayer.pause();
        }
    }, [playbackState, tracks, queue]);

    const handleStepBackward = useCallback(async () => {
        if(queue.currentIndex == 0) return;
        const wasPlaying = playbackState == State.Playing;
        await skipTo(queue.currentIndex - 1, dispatch, wasPlaying);
    }, [queue.currentIndex, queue.orderMap, playbackState]);

    const handleStepForward = useCallback(async () => {
        if(queue.currentIndex == (queue.orderMap.length - 1)) return;
        const wasPlaying = playbackState == State.Playing;
        await skipTo(queue.currentIndex + 1, dispatch, wasPlaying);
    }, [queue.currentIndex, queue.orderMap, playbackState]);

    const handleLoopButton = useCallback(async () => {
        if (queue.orderMap.length == 0) return;

        QueueBridge.ConfigBridge.setLooping(!currentConfig.isLooping, queue.playlistConfigId, dispatch);

        if (!currentConfig.isLooping)
            await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        else
            await TrackPlayer.setRepeatMode(RepeatMode.Off);
    }, [queue.playlistConfigId, currentConfig.isLooping]);

    const handleShuffleButton = useCallback(async () => {
        if (queue.orderMap.length == 0) return;

        if(queue.currentIndex < queue.orderMap.length - 2 && queue.orderMap.length > 2) {
            toggleOrderChanging(true);
    
            const shuffled = shuffle(queue.orderMap.slice(queue.currentIndex + 1));
            shuffled.unshift(...queue.orderMap.slice(0, queue.currentIndex + 1));
    
            await QueueBridge.setOrderMap(shuffled, dispatch);
            const millisBeforeUpdate = queue.currentMillis;
            const isPlaying = playbackState == State.Playing;
    
            await updateQueueOrder(tracks, shuffled, queue.currentIndex, millisBeforeUpdate, isPlaying, dispatch);
    
            toggleOrderChanging(false);
        } else {
            Toast.show("Amestecarea este redundantă..");
        }
    }, [tracks, queue]);

    const handleReverseButton = useCallback(async () => {
        if (queue.orderMap.length == 0) return;

        if (queue.currentIndex < queue.orderMap.length - 2 && queue.orderMap.length > 2) {
            toggleOrderChanging(true);

            const reversed = reverse(queue.orderMap.slice(queue.currentIndex + 1));
            reversed.unshift(...queue.orderMap.slice(0, queue.currentIndex + 1));

            await QueueBridge.setOrderMap(reversed, dispatch);
            const millisBeforeUpdate = queue.currentMillis;
            const isPlaying = playbackState == State.Playing;

            await updateQueueOrder(tracks, reversed, queue.currentIndex, millisBeforeUpdate, isPlaying, dispatch);

            toggleOrderChanging(false);
        } else {
            Toast.show("Inversarea este redundantă..");
        }
    }, [tracks, queue]);

    const handleFavoriteButton = useCallback(async () => {
        if (queue.orderMap.length == 0) return;
        await TrackBridge.toggleFavorite(queue.orderMap[queue.currentIndex], dispatch);
    }, [queue.orderMap, queue.currentIndex]);

    const handleDynamicSoundButton = useCallback(async () => {
        const checkRes = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
        
        if (checkRes != RESULTS.GRANTED) {
            const reqRes = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);

            if (reqRes != RESULTS.GRANTED) {
                Toast.show("Volumul dinamic va ramane dezactivat fara permisiune..");
                return;
            }
        }
        
        await QueueBridge.setDynamicSound(!queue.dynamic, dispatch);
    }, [queue.dynamic]);

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
                    onPress={handleShuffleButton}
                    VectorIcon={EntypoNB}
                    name="shuffle"
                    color="primary.50"
                    toastMessage="Amestecă"/>

                <Box w="0.5" h="100%" bg="gray.800" />

                <MusicPlayerButton
                    onPress={handleReverseButton}
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

                <Box w="0.5" h="100%" bg="gray.800" />

                <MusicPlayerButton
                    onPress={handleDynamicSoundButton}
                    VectorIcon={MaterialIconsNB}
                    name={queue.dynamic ? "hearing" : "hearing-disabled"}
                    color="primary.50"
                    fontSize="xl"
                    toastMessage="Sunet dinamic" />
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