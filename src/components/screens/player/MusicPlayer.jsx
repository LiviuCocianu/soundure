import React, { useEffect, useState, useMemo } from 'react'
import { AspectRatio, Box, Factory, HStack, Image, Pressable, Text, VStack } from 'native-base'

import { useDispatch, useSelector } from 'react-redux';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import MarqueeText from 'react-native-marquee'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LightenDarkenColor } from 'lighten-darken-color';
import TrackPlayer, { Event, State, usePlaybackState, useProgress, useTrackPlayerEvents } from 'react-native-track-player';
import { Slider } from '@miblanchard/react-native-slider';

import PlayerQueue from './PlayerQueue';
import { QueueBridge } from '../../../database/componentBridge';
import { find, handleColors, handleCoverURI, isTooDark, lng } from '../../../functions';
import { PLAYER_DOWN_HEIGHT, PLAYER_UP_HEIGHT } from '../../../constants';


const EntypoNB = Factory(Entypo);
const MaterialNB = Factory(MaterialCommunityIcons);
const MarqueeNB = Factory(MarqueeText);

// TODO add documentation
const MusicPlayer = () => {
    const dispatch = useDispatch();

    const [isPlaying, togglePlayback] = useState(false);
    const { position, buffered, duration } = useProgress(500);
    const playbackState = usePlaybackState();

    const heightAnimValue = useSharedValue(PLAYER_DOWN_HEIGHT);
    const heightAnimStyle = useAnimatedStyle(() => ({
        height: withTiming(heightAnimValue.value, { duration: 600, easing: Easing.inOut(Easing.cubic) })
    }));

    const opacityAnimValue = useSharedValue(0);
    const opacityAnimStyle = useAnimatedStyle(() => ({
        opacity: withTiming(opacityAnimValue.value, { duration: 1000, easing: Easing.inOut(Easing.cubic) })
    }));

    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);
    const queue = useSelector(state => state.queue);

    const currentTrack = useMemo(() => {
        const found = find(tracks, "id", queue.orderMap[queue.currentIndex], {
            title: "--",
            millis: 0
        });
        
        return found;
    }, [queue.orderMap, queue.currentIndex]);

    const cover = useMemo(() => {
        return typeof(currentTrack.coverURI) !== "string"
            ? require("../../../../assets/images/soundure_unavailable_white.png")
            : handleCoverURI(currentTrack.coverURI);
    }, [currentTrack.coverURI]);

    const currentTrackArtist = useMemo(() => {
        return find(artists, "id", currentTrack.artistId, {
            name: "--"
        });
    }, [artists, currentTrack]);

    const [expanded, toggleExpansion] = useState(false);
    const [primaryColor, setPrimaryColor] = useState("primary.50");

    const maxH = expanded ? "20" : "24";

    useEffect(() => {
        heightAnimValue.value = expanded ? PLAYER_UP_HEIGHT : PLAYER_DOWN_HEIGHT;
        opacityAnimValue.value = expanded ? 1 : 0;
    }, [expanded]);

    useEffect(() => {
        QueueBridge.setCurrentMillis(0, dispatch);
    }, [queue.currentIndex]);

    useEffect(() => {
        handleColors(currentTrack.coverURI).then(colors => {
            let output = colors.primary;

            if(isTooDark(output)) output = LightenDarkenColor(output, 60);
    
            return output.length < 3 ? "#FFF" : output;
        }).then(color => setPrimaryColor(color));
    }, [currentTrack, queue.currentIndex]);

    useEffect(() => {
        QueueBridge.setCurrentMillis(position * 1000, dispatch);

        if(position >= duration) {
            togglePlayback(false);
        }
    }, [position, duration]);

    useEffect(() => {
        if (playbackState !== State.Playing) {
            QueueBridge.setCurrentMillis(position * 1000, dispatch);
        }
    }, [isPlaying]);

    useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async event => {
        if(event.type == Event.PlaybackState) {
            togglePlayback(event.state === State.Playing);
        } else if (event.type == Event.PlaybackTrackChanged) {
            if(event.nextTrack != null) {
                await QueueBridge.setIndex(event.nextTrack, dispatch);
            }
        }
    });

    const handlePlayerExpansion = () => {
        toggleExpansion(!expanded);
    }

    const handleProgressFingerUp = async (value) => {
        const val = Math.floor(value[0]);
        const oldState = isPlaying;

        await TrackPlayer.seekTo(val);
        await QueueBridge.setCurrentMillis(val, dispatch);

        if(!oldState)
            await TrackPlayer.pause();
    }

    const handlePlayPause = async () => {
        const queue = await TrackPlayer.getQueue();

        if(queue.length > 0) {
            if(!isPlaying) await TrackPlayer.play();
            else await TrackPlayer.pause();
        }
    }

    return (
        <Animated.View
            style={{
                width: "100%",
                position: "absolute",
                bottom: 0,
                ...heightAnimStyle
            }}
        >
            <Box bg={lng(["gray.700", "gray.800"], "top")}
                borderTopWidth="2"
                borderTopColor={primaryColor}
            >
                <HStack w="100%" h="100%" maxH={maxH} px="4" mt={expanded ? "2" : "0"}
                    alignItems="center"
                    space="2"
                >
                    <HStack flexGrow="1" h="80%" space="4">
                        <Pressable onPress={handlePlayerExpansion}>
                            <AspectRatio ratio="4/4" h="100%" maxH={maxH}>
                                <Image
                                    size="100%"
                                    source={cover}
                                    alt="music player track thumbnail"
                                    key={currentTrack.coverURI}
                                    rounded="lg" />
                            </AspectRatio>
                        </Pressable>

                        
                        <VStack flexGrow="1" h="100%"
                            maxW="62%" maxH={maxH}
                            justifyContent="center"
                        >
                            <Pressable w="100%" onPress={handlePlayerExpansion}>
                                <HStack w="100%" justifyContent="space-between">
                                    <MarqueeNB w="85%" color="white"
                                        fontFamily="quicksand_b"
                                        fontSize={expanded ? "sm" : "md"}
                                        lineHeight="xs"
                                        speed={0.5}>{currentTrack.title}</MarqueeNB>

                                    <EntypoNB
                                        name="cog"
                                        color="primary.50"
                                        fontSize={expanded ? "md" : "lg"}/>
                                </HStack>

                                <MarqueeNB w="100%"
                                    color="gray.200"
                                    fontFamily="quicksand_l"
                                    fontSize={expanded ? "10" : "xs"}
                                    lineHeight="xs"
                                    speed={0.5}>{currentTrackArtist.name}</MarqueeNB>
                            </Pressable>

                            <VStack w="100%" space="1">
                                <Slider trackClickable
                                    containerStyle={{ width: "100%", height: 15 }}
                                    trackStyle={{height: expanded ? 8 : 5}}
                                    value={position}
                                    minimumValue={0}
                                    maximumValue={duration}
                                    minimumTrackTintColor={primaryColor}
                                    renderThumbComponent={() => <></>}
                                    onSlidingComplete={handleProgressFingerUp}
                                />

                                <HStack w="100%" justifyContent="space-between">
                                    <Text color="white"
                                        fontFamily="manrope_l"
                                        fontSize="8"
                                    >
                                        {(position).toString().toHHMMSS()}
                                    </Text>

                                    <Text color="white"
                                        fontFamily="manrope_l"
                                        fontSize="8"
                                    >
                                        {(duration).toString().toHHMMSS()}
                                    </Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </HStack>

                    <Pressable position="absolute" right="1"
                        onPress={handlePlayPause}
                    >
                        {
                            !isPlaying ? (
                                <EntypoNB
                                    fontSize="40"
                                    name="controller-play"
                                    color="primary.50" />
                            ) : (
                                <MaterialNB
                                    fontSize="40"
                                    name="pause"
                                    color="primary.50" />
                            )
                        }
                    </Pressable>
                </HStack>

                {/* // Order controller */}
                <Animated.View style={opacityAnimStyle}>
                    <PlayerQueue 
                        handlePlayerExpansion={handlePlayerExpansion}/>
                </Animated.View>
            </Box>
        </Animated.View>
    )
}


export default MusicPlayer