import React, { memo, useMemo } from 'react'
import { TouchableHighlight } from 'react-native'
import { Box, AspectRatio, Factory, HStack, Image, Text, VStack } from 'native-base'

import { OpacityDecorator } from 'react-native-draggable-flatlist'

import { Entypo, Foundation, MaterialCommunityIcons } from '@expo/vector-icons'
import MarqueeText from 'react-native-marquee'
import { QUEUE_TRACK_EL_HEIGHT } from '../../../constants'
import { handleCoverURI } from '../../../functions'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { QueueBridge } from '../../../database/componentBridge'
import { skipTo } from '../../../sound/orderPanel/playFunctions'


const MarqueeNB = Factory(MarqueeText);
const EntypoNB = Factory(Entypo);
const FoundationNB = Factory(Foundation);
const MaterialNB = Factory(MaterialCommunityIcons);

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
 * 
 * @returns {JSX.Element} JSX component
 */
const PlayerQueueElement = ({
    track,
    artist,
    drag,
    isActive
}) => {
    const dispatch = useDispatch();

    const orderMap = useSelector(state => state.queue.orderMap);
    
    const currentIndex = useSelector(state => state.queue.currentIndex);
    const ownOrderIndex = useMemo(() => orderMap.length != 0 ? orderMap.indexOf(track.id) : 0, [orderMap]);

    const relativeToCurrent = useMemo(() => {
        return ownOrderIndex == currentIndex ? 0 
            : ownOrderIndex < currentIndex 
            ? -1 : 1;
    }, [ownOrderIndex, currentIndex]);

    const elementColor = useMemo(() => relativeToCurrent > -1 ? "gray.600" : "gray.700", [relativeToCurrent]);
    const elementBorder = useMemo(() => relativeToCurrent == 0 ? 1 : 0, [relativeToCurrent]);
    const elementIsDisabled = useMemo(() => isActive || relativeToCurrent == 0, [isActive, relativeToCurrent]);

    const handlePress = useCallback(async () => {
        if(orderMap.length > 0) {
            skipTo(ownOrderIndex, dispatch);
        }
    }, [orderMap, ownOrderIndex]);

    // TODO finish this
    const handleSettingsButton = useCallback(() => {
    
    }, []);

    return (
        <OpacityDecorator>
            <TouchableHighlight
                onPress={handlePress}
                disabled={elementIsDisabled}
                style={{ marginTop: 4 }}
            >
                <HStack w="100%" h={`${QUEUE_TRACK_EL_HEIGHT}px`}
                    bg={elementColor}
                    alignItems="center"
                    borderWidth={elementBorder}
                    borderColor="gray.400"
                >
                    <TrackInfo
                        title={track.title}
                        coverURI={track.coverURI}
                        millis={track.millis}
                        artistName={artist.name}
                        relativeToCurrent={relativeToCurrent}/>

                    <Box position="absolute"
                        right="0"
                        alignSelf="center"
                    >
                        {
                            relativeToCurrent == 0 ? (
                                <EntypoNB pr="2" py="4"
                                    name="dots-three-vertical"
                                    color="white"
                                    onPress={handleSettingsButton}
                                    fontSize={20}/>
                            ) : relativeToCurrent == 1 
                            ? (
                                <MaterialNB pr="2" py="4"
                                    name="drag-horizontal-variant"
                                    color="white"
                                    onLongPress={drag}
                                    fontSize={20}/>
                            ) : <></>
                        }
                    </Box>
                </HStack>
            </TouchableHighlight>
        </OpacityDecorator>
    )
}

const TrackInfo = memo(({
    title,
    coverURI,
    millis,
    artistName,
    relativeToCurrent
}) => {
    return (
        <>
            <AspectRatio ratio="4/4" h="80%" ml="2">
                <Image size="100%"
                    source={handleCoverURI(coverURI)}
                    alt="queue track element cover"/>
            </AspectRatio>

            <VStack h="80%" maxW="72%" ml="4"
                flexGrow={1}
                justifyContent="center"
            >
                <HStack maxW="100%" alignItems="center" space="2">
                    {
                        relativeToCurrent == 0 ? (
                            <FoundationNB
                                name="sound"
                                color="white"
                                fontSize={20} />
                        ) : <></>
                    }

                    <MarqueeNB w="80%"
                        position="relative" bottom="0.5"
                        color="white"
                        fontFamily="quicksand_b"
                        fontSize="md"
                        speed={0.5}>{title}</MarqueeNB>
                </HStack>

                <HStack maxW="80%" alignItems="center">
                    <Text color="gray.400"
                        fontFamily="manrope_l"
                        fontSize="2xs">{(millis / 1000).toString().toHHMMSS()} • </Text>
                    
                    <MarqueeNB flexGrow="1"
                        color="gray.400"
                        fontFamily="manrope_r"
                        fontSize="2xs"
                        speed={0.5}>{artistName}</MarqueeNB>
                </HStack>
            </VStack>
        </>
    )
});

const propsAreEqual = (prev, next) => (
    prev.track.coverURI === next.track.coverURI
    && prev.track.title === next.track.title
    && prev.track.millis === next.track.millis
    && prev.artist.name === next.artist.name
    && prev.drag === next.drag
    && prev.isActive === next.isActive
);


export default memo(PlayerQueueElement, propsAreEqual);