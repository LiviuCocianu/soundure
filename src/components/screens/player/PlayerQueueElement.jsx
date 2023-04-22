import React, { useMemo, useState } from 'react'
import { TouchableHighlight } from 'react-native'
import { AspectRatio, Factory, HStack, Image, Text, VStack } from 'native-base'

import { OpacityDecorator } from 'react-native-draggable-flatlist'

import { Entypo, Foundation } from '@expo/vector-icons'
import MarqueeText from 'react-native-marquee'
import { QUEUE_TRACK_EL_HEIGHT } from '../../../constants'
import { handleCoverURI } from '../../../functions'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { QueueBridge } from '../../../database/componentBridge'


const MarqueeNB = Factory(MarqueeText);
const EntypoNB = Factory(Entypo);
const FoundationNB = Factory(Foundation);

/**
 * @callback drag
 */

/**
 * PlayerQueueElement component
 * 
 * @param {object} props props object
 * @param {object} props.track Track info
 * @param {object} props.artist Artist info
 * @param {drag} props.drag Callback used in dragging event
 * @param {boolean} props.isActive This boolean will toggle when the element is being dragged
 * @param {string} props.dominantColor Dominant color picked from the cover URI
 * 
 * @returns {JSX.Element} JSX component
 */
const PlayerQueueElement = ({
    track,
    artist,
    drag,
    isActive,
    dominantColor
}) => {
    const dispatch = useDispatch();

    const currentIndex = useSelector(state => state.queue.currentIndex);
    const orderMap = useSelector(state => state.queue.orderMap);

    const ownOrderIndex = useMemo(() => orderMap.length != 0 ? orderMap.indexOf(track.id) : 0, [orderMap]);
    const pastCurrentTrack = useMemo(() => ownOrderIndex < currentIndex, [ownOrderIndex, currentIndex]);

    const handlePress = useCallback(() => {
        if(orderMap.length != 0)
            QueueBridge.setIndex(ownOrderIndex, dispatch);
    }, [orderMap, ownOrderIndex]);

    // TODO finish this
    const handleSettingsButton = useCallback(() => {
        
    }, []);

    return (
        <OpacityDecorator>
            <TouchableHighlight
                onPress={handlePress}
                onLongPress={drag}
                disabled={isActive || ownOrderIndex == currentIndex}
                style={{ marginTop: 4 }}
            >
                <HStack w="100%" h={`${QUEUE_TRACK_EL_HEIGHT}px`}
                    bg={!pastCurrentTrack ? "gray.600" : "gray.700"}
                    alignItems="center"
                    borderWidth={ownOrderIndex == currentIndex ? 1 : 0}
                    borderColor="gray.400"
                >
                    <AspectRatio ratio="4/4" h="80%" ml="2">
                        <Image size="100%"
                            borderWidth="2"
                            borderColor="gray.800"
                            source={handleCoverURI(track.coverURI)}
                            alt="queue track element cover"/>
                    </AspectRatio>

                    <VStack h="80%" maxW="65%" ml="4"
                        flexGrow={1}
                        justifyContent="center"
                    >
                        <HStack maxW="80%" alignItems="center" space="2">
                            {
                                ownOrderIndex == currentIndex ? (
                                    <FoundationNB
                                        name="sound"
                                        color={dominantColor}
                                        fontSize={20} />
                                ) : <></>
                            }

                            <MarqueeNB position="relative" bottom="0.5"
                                color="white"
                                fontFamily="quicksand_b"
                                fontSize="md"
                                speed={0.5}>{track.title}</MarqueeNB>
                        </HStack>

                        <HStack maxW="80%" alignItems="center">
                            <Text color="gray.400"
                                fontFamily="manrope_l"
                                fontSize="2xs">{(track.millis / 1000).toString().toHHMMSS()} • </Text>
                            
                            <MarqueeNB color="gray.400"
                                fontFamily="manrope_r"
                                fontSize="2xs"
                                speed={0.5}>{artist.name}</MarqueeNB>
                        </HStack>
                    </VStack>

                    <EntypoNB pr="2" py="4"
                        onPress={handleSettingsButton}
                        position="absolute" right="0"
                        color="white"
                        name="dots-three-vertical"
                        fontSize={20}
                        alignSelf="center"/>
                </HStack>
            </TouchableHighlight>
        </OpacityDecorator>
    )
}


export default PlayerQueueElement