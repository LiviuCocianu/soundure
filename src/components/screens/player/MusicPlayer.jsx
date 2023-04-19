import React, { useEffect, useState } from 'react'
import { Dimensions } from 'react-native';
import { AspectRatio, Box, Factory, HStack, Image, Pressable, Progress, Text, VStack } from 'native-base'

import { Entypo, FontAwesome5 } from '@expo/vector-icons'
import MarqueeText from 'react-native-marquee'

import { handleCoverURI, lng } from '../../../functions';
import Toast from 'react-native-root-toast';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import PlayerQueue from './PlayerQueue';


const screenHeight = Dimensions.get("screen").height;
const PLAYER_UP_HEIGHT = screenHeight * 0.6;
const PLAYER_DOWN_HEIGHT = screenHeight * 0.12;

const EntypoNB = Factory(Entypo);
const FontAwesomeNB = Factory(FontAwesome5);
const MarqueeNB = Factory(MarqueeText);

// TODO add documentation
const MusicPlayer = () => {
    const heightAnimValue = useSharedValue(PLAYER_DOWN_HEIGHT);
    const heightAnimStyle = useAnimatedStyle(() => ({
        height: withTiming(heightAnimValue.value, { duration: 600, easing: Easing.inOut(Easing.cubic) })
    }));

    const opacityAnimValue = useSharedValue(0);
    const opacityAnimStyle = useAnimatedStyle(() => ({
        opacity: withTiming(opacityAnimValue.value, { duration: 1000, easing: Easing.inOut(Easing.cubic) })
    }));

    const maxH = expanded ? "20" : "24";

    const [primaryColor, setPrimaryColor] = useState("primary.50");
    const [trackProgress, setTrackProgress] = useState(50);

    const [expanded, toggleExpansion] = useState(false);

    useEffect(() => {
        heightAnimValue.value = expanded ? PLAYER_UP_HEIGHT : PLAYER_DOWN_HEIGHT;
        opacityAnimValue.value = expanded ? 1 : 0;
    }, [expanded]);

    const handlePlayerExpansion = () => {
        toggleExpansion(!expanded);
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
                            <AspectRatio ratio="4/4" h="100%" maxH={maxH}>
                                <Image
                                    size="100%"
                                    source={handleCoverURI(undefined)} // TODO replace undefined with cover reference
                                    alt="music player track thumbnail"
                                    rounded="lg" />
                            </AspectRatio>
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
                                            speed={0.5}>Titlu piesă</MarqueeNB>

                                        <EntypoNB
                                            name="cog"
                                            color={primaryColor}
                                            fontSize={expanded ? "md" : "lg"}/>
                                    </HStack>

                                    <Text color="gray.200"
                                        fontFamily="quicksand_l"
                                        fontSize={expanded ? "10" : "xs"}
                                        lineHeight="xs">Nume artist</Text>
                                </Pressable>

                                <VStack w="100%" space="1">
                                    <Progress mt="2" w="100%" h={expanded ? "1.5" : "0.5"}
                                        value={trackProgress}
                                        bg="gray.500"
                                        rounded="none"
                                        _filledTrack={{
                                            bg: primaryColor,
                                            rounded: "none",
                                        }} />

                                    <HStack w="100%" justifyContent="space-between">
                                        {/* TODO replace with reference */}
                                        <Text color="white"
                                            fontFamily="manrope_l"
                                            fontSize="8"
                                        >
                                            {"0".toHHMMSS()}
                                        </Text>

                                        <Text color="white"
                                            fontFamily="manrope_l"
                                            fontSize="8"
                                        >
                                            {"0".toHHMMSS()}
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
                    <VStack h="100%" mt="2" alignItems="center">
                        <HStack w="90%" h="8"
                            alignItems="center"
                            bg="gray.700"
                            rounded="lg"
                        >
                            <OrderControlButton
                                VectorIcon={EntypoNB}
                                name="loop"
                                color={primaryColor}
                                toastMessage="Redă în buclă"/>

                            <Box w="0.5" h="100%" bg="gray.800"/>

                            <OrderControlButton
                                VectorIcon={EntypoNB}
                                name="shuffle"
                                color={primaryColor}
                                toastMessage="Amestecă"/>

                            <Box w="0.5" h="100%" bg="gray.800" />

                            <OrderControlButton
                                VectorIcon={FontAwesomeNB}
                                name="angle-double-left"
                                color={primaryColor}
                                toastMessage="Redă invers"/>
                        </HStack>

                        <PlayerQueue/>
                    </VStack>
                </Animated.View>
            </Box>
        </Animated.View>
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


export default MusicPlayer