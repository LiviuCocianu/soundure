import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, Factory, HStack, Pressable, Text, VStack } from 'native-base'

import { useDispatch, useSelector } from 'react-redux';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AntDesign, Entypo, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { reversedPlay, shuffledPlay, simplePlay } from '../../../sound/orderPanel/playFunctions';
import Toast from 'react-native-root-toast';


const AntDesignNB = Factory(AntDesign);
const EntypoNB = Factory(Entypo);
const FontAwesomeNB = Factory(FontAwesome5);
const MaterialNB = Factory(MaterialCommunityIcons);

const PANEL_WIDTH = 170;
const BUTTON_WIDTH = 30;
const BUTTON_HEIGHT = 50;

// TODO document this
const OrderPanel = ({
    playlistId,
    coverHeight
}) => {
    const dispatch = useDispatch();
    const tracks = useSelector(state => state.tracks);
    const links = useSelector(state => state.playlistsContent);

    const ownLinks = useMemo(() => links.filter(link => link.playlistId == playlistId), [links, playlistId]);

    const [panelDrawn, togglePanel] = useState(true);

    const animValue = useSharedValue(PANEL_WIDTH);
    const animStyle = useAnimatedStyle(() => ({
        position: "absolute",
        right: 0,
        top: (coverHeight - BUTTON_HEIGHT) / 2,
        zIndex: 1,
        transform: [{translateX: withTiming(animValue.value, { duration: 200 })}]
    }));

    useEffect(() => {
        animValue.value = !panelDrawn ? 1 : PANEL_WIDTH;
    }, [animValue, panelDrawn]);

    const handleDisplay = () => togglePanel(!panelDrawn);

    const canPlay = () => {
        if(ownLinks.length == 0) {
            Toast.show("Nu s-au găsit piese de redat..");
            return false;
        }

        return true;
    };

    const handleSimplePlay = useCallback(() => {
        handleDisplay();

        if(!canPlay()) return;

        simplePlay(playlistId, tracks, dispatch);
    }, [playlistId, tracks]);

    const handleShuffledPlay = useCallback(() => {
        handleDisplay();

        if(!canPlay()) return;

        shuffledPlay(playlistId, tracks, dispatch);
    }, [playlistId, tracks]);

    const handleReversedPlay = useCallback(() => {
        handleDisplay();

        if(!canPlay()) return;

        reversedPlay(playlistId, tracks, dispatch);
    }, [playlistId, tracks]);

    return (
        <Animated.View style={{
            ...animStyle
        }}>
            <VStack w={PANEL_WIDTH} minH="12" pb="2"
                bg="black:alpha.70"
                alignItems="center"
                borderWidth={1}
                borderColor="gray.400"
                borderBottomLeftRadius="lg"
            >
                <Pressable w={BUTTON_WIDTH} h={BUTTON_HEIGHT}
                    position="absolute"
                    left={-29}
                    onPress={handleDisplay}
                >
                    <Box w={BUTTON_WIDTH} h={BUTTON_HEIGHT}
                        alignItems="center"
                        justifyContent="center"
                        bg="black"
                        borderWidth={1}
                        borderTopLeftRadius="xl"
                        borderBottomLeftRadius="xl"
                    >
                        <AntDesignNB
                            name="caretright"
                            color="white"
                            fontSize={25} />
                    </Box>
                </Pressable>

                <Pressable onPress={handleDisplay}>
                    <Text mt="3" mb="2"
                        color="white"
                        fontFamily="quicksand_b">Ascultă playlist:</Text>
                </Pressable>

                <OrderButton 
                    IconType={AntDesignNB}
                    name="caretright"
                    color="white"
                    text="Redă simplu"
                    onPress={handleSimplePlay}/>

                <OrderButton 
                    IconType={EntypoNB}
                    name="shuffle"
                    color="white"
                    text="Redă amestecat"
                    onPress={handleShuffledPlay}/>

                <OrderButton 
                    IconType={FontAwesomeNB}
                    name="angle-double-left"
                    color="white"
                    text="Redă inversat"
                    onPress={handleReversedPlay}/>

                <OrderButton
                    IconType={MaterialNB}
                    name="play-network"
                    color="white"
                    text="Redă începând cu"/>
            </VStack>
        </Animated.View>
    )
}

const OrderButton = ({
    IconType,
    name,
    color,
    text,
    onPress
}) => {
    return (
        <Pressable w="100%" h="10"
            onPress={onPress}
            _pressed={{ opacity: 0.5 }}
        >
            <HStack w="100%" h="100%" ml="3"
                space="2"
                alignItems="center"
            >
                <IconType
                    name={name}
                    color={color}
                    fontSize={20}/>

                <Text color="white"
                    fontFamily="manrope_r"
                    fontSize="xs">{text}</Text>
            </HStack>
        </Pressable>
    )
}


export default OrderPanel