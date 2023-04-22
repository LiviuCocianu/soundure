import React, { useEffect, useState, useMemo } from 'react'
import { AspectRatio, Box, Factory, HStack, Image, Pressable, Slider, Text, VStack } from 'native-base'

import { useDispatch, useSelector } from 'react-redux';
import { Entypo } from '@expo/vector-icons'
import MarqueeText from 'react-native-marquee'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import PlayerQueue from './PlayerQueue';
import { QueueBridge } from '../../../database/componentBridge';
import { find, handleColors, handleCoverURI, lng } from '../../../functions';
import { PLAYER_DOWN_HEIGHT, PLAYER_UP_HEIGHT } from '../../../constants';
import { memo } from 'react';


const EntypoNB = Factory(Entypo);
const MarqueeNB = Factory(MarqueeText);

// TODO add documentation
const MusicPlayer = () => {
    const dispatch = useDispatch();

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
        return find(tracks, "id", queue.orderMap[queue.currentIndex], {
            title: "--",
            millis: 0
        });
    }, [queue.orderMap, queue.currentIndex]);

    const currentTrackArtist = useMemo(() => {
        return find(artists, "id", currentTrack.artistId, {
            name: "--"
        });
    }, [artists, currentTrack])

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
        handleColors(currentTrack.coverURI).then(colors => setPrimaryColor(colors.primary));
    }, [currentTrack, queue.currentIndex]);

    const handlePlayerExpansion = () => {
        toggleExpansion(!expanded);
    }

    const handleProgressChange = (value) => {
        QueueBridge.setCurrentMillis(value, dispatch, ["redux"]);
    }

    const handleProgressFingerUp = (value) => {
        QueueBridge.setCurrentMillis(value, dispatch);
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
                borderTopWidth="1"
                borderTopColor={primaryColor}
            >
                <HStack w="100%" h="100%" maxH={maxH} px="4" mt={expanded ? "2" : "0"}
                    alignItems="center"
                    space="2"
                >
                    <HStack flexGrow="1" h="80%" space="4">
                        <Pressable onPress={handlePlayerExpansion}>
                            <MusicPlayerThumbnail
                                maxH={maxH}
                                coverURI={currentTrack.coverURI}/>
                        </Pressable>

                        
                        <VStack flexGrow="1" h="100%"
                            maxW="62%" maxH={maxH}
                            justifyContent="center"
                        >
                            <Pressable w="100%" onPress={handlePlayerExpansion}>
                                <HStack w="100%" justifyContent="space-between">
                                    <MarqueeNB color="white"
                                        fontFamily="quicksand_b"
                                        fontSize={expanded ? "sm" : "md"}
                                        lineHeight="xs"
                                        speed={0.5}>{currentTrack.title}</MarqueeNB>

                                    <EntypoNB
                                        name="cog"
                                        color={primaryColor}
                                        fontSize={expanded ? "md" : "lg"}/>
                                </HStack>

                                <Text color="gray.200"
                                    fontFamily="quicksand_l"
                                    fontSize={expanded ? "10" : "xs"}
                                    lineHeight="xs">{currentTrackArtist.name}</Text>
                            </Pressable>

                            <VStack w="100%" space="1">
                                <Slider mt="2" w="100%" h={expanded ? "1.5" : "0.5"}
                                    defaultValue={0}
                                    minValue={0}
                                    maxValue={currentTrack.millis}
                                    value={queue.currentMillis}
                                    onChange={handleProgressChange}
                                    onChangeEnd={handleProgressFingerUp}
                                >
                                    <Slider.Track 
                                        bg="gray.500" 
                                        rounded="none" 
                                        size={expanded ? 10 : 5}
                                    >
                                        <Slider.FilledTrack 
                                            bg={primaryColor}
                                            rounded="none"
                                            size={expanded ? 10 : 5}/>
                                    </Slider.Track>
                                    <Slider.Thumb bg="transparent" borderWidth={0} _pressed={{ bg: "gray.200:alpha.50" }}/>
                                </Slider>

                                <HStack w="100%" justifyContent="space-between">
                                    <Text color="white"
                                        fontFamily="manrope_l"
                                        fontSize="8"
                                    >
                                        {(queue.currentMillis / 1000).toString().toHHMMSS()}
                                    </Text>

                                    <Text color="white"
                                        fontFamily="manrope_l"
                                        fontSize="8"
                                    >
                                        {(currentTrack.millis / 1000).toString().toHHMMSS()}
                                    </Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </HStack>

                    <EntypoNB position="absolute" right="1"
                        fontSize="40"
                        name="controller-play"
                        color={primaryColor} />
                </HStack>

                {/* // Order controller */}
                <Animated.View style={opacityAnimStyle}>
                    <PlayerQueue dominantColor={primaryColor}/>
                </Animated.View>
            </Box>
        </Animated.View>
    )
}


const MusicPlayerThumbnail = memo(({
    maxH,
    coverURI
}) => {
    return (
        <AspectRatio ratio="4/4" h="100%" maxH={maxH}>
            <Image
                size="100%"
                source={handleCoverURI(coverURI, require("../../../../assets/images/soundure_unavailable_white.png"))}
                alt="music player track thumbnail"
                rounded="lg" />
        </AspectRatio>
    );
}, (prev, next) => (
    prev.maxH == next.maxH
    && prev.coverURI == next.coverURI
));

export default MusicPlayer