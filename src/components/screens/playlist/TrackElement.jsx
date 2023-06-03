import React, { useEffect, useState, memo, useCallback } from 'react';
import { Dimensions, ImageBackground } from 'react-native';
import { 
    HStack,
    Factory,
    AspectRatio,
    VStack,
    Text,
    Pressable,
    Checkbox,
    useDisclose
} from 'native-base'

import { Entypo, AntDesign } from '@expo/vector-icons';
import MarqueeText from 'react-native-marquee'

import PlatformIcon from '../../general/PlatformIcon';
import TrackSettingsSheet from '../track/TrackSettingsSheet';

import { handleCoverURI, lng } from '../../../functions';
import { ARTIST_NAME_PLACEHOLDER, TRACK_EL_HEIGHT } from '../../../constants';
import { useMemo } from 'react';


const SCREEN_WIDTH = Dimensions.get("screen").width;
const ELEMENT_WIDTH = SCREEN_WIDTH - (SCREEN_WIDTH * 0.05);

const ImageNB = Factory(ImageBackground);
const EntypoNB = Factory(Entypo);
const AntDesignNB = Factory(AntDesign);
const MarqueeNB = Factory(MarqueeText);

/**
 * @callback selectionHandler
 * @param {boolean} isSelected Indicates if the checkbox is checked
 * @param {number} trackId Track ID in database
 */

/**
 * TrackElement component
 * 
 * @param {object} props props object
 * @param {object} props.navigation Object generated by React Navigation
 * @param {object} props.track Object containing track info
 * @param {object} props.artist Object containing artist info
 * @param {number} [props.playlistId] ID in database of playlist that currently owns this element
 * @param {boolean} [props.selectionMode] Indicates if the element is in selection mode
 * @param {boolean} props.allSelected External state that is used to signal this element
 *                                    to check its checkbox. Used for "select all" functionality
 * @param {selectionHandler} [props.selectionHandler] Callback that triggers when a checkbox has been changed.
 * 
 * @returns {JSX.Element} JSX component
 */
const TrackElement = ({
    navigation,
    track,
    artist,
    playlistId=undefined,
    selectionMode=false,
    allSelected,
    selectionHandler=() => {}
}) => {
    const disclose = useDisclose();

    const [isSelected, setSelected] = useState(false);

    const cover = useMemo(() => handleCoverURI(track.coverURI), [track.coverURI]);

    useEffect(() => {
        setSelected(allSelected);
        selectionHandler(allSelected, null);
    }, [allSelected]);

    const handleSelection = useCallback((isSelected) => {
        setSelected(isSelected);
        selectionHandler(isSelected, track.id);
    }, [selectionHandler, track]);

    const handlePress = useCallback(() => {
        if (selectionMode) handleSelection(!isSelected);
    }, [selectionMode, isSelected, handleSelection]);

    const handleSettingsButton = useCallback(() => {
        disclose.onOpen();
    }, [disclose]);

    return (
        <Pressable _pressed={{ opacity: 0.8 }} 
            onPress={handlePress}
        >
            <HStack w={ELEMENT_WIDTH} h={TRACK_EL_HEIGHT} mb="1"
                bg={lng(["primary.700", "gray.900"])}
                rounded="lg" 
                shadow={10}
            >
                <AspectRatio ratio="4/4" h="auto">
                    <ImageNB
                        source={cover}
                        imageStyle={{
                            borderTopLeftRadius: 10,
                            borderBottomLeftRadius: 10
                        }} />
                </AspectRatio>

                <VStack w="auto" pl="6" mr="auto"
                    justifyContent="center"
                    borderTopRightRadius="lg"
                    borderBottomRightRadius="lg"
                >
                    <MarqueeNB w={ELEMENT_WIDTH * 0.55}
                        color="white"
                        fontFamily="quicksand_b"
                        fontSize="md"
                        speed={0.3}>{track.title ? track.title : ""}</MarqueeNB>

                    <Text color={artist.name == ARTIST_NAME_PLACEHOLDER ? "gray.400" : "white"}
                        fontFamily={artist.name == ARTIST_NAME_PLACEHOLDER ? "manrope_li" : "manrope_r"}
                        fontSize="xs">{artist.name ? artist.name : ""}</Text>

                    <HStack space={1} mt="1" alignItems="center">
                        <EntypoNB name="controller-play" color="primary.50">
                            <Text
                                color="primary.50"
                                fontFamily="manrope_l"
                                fontSize="xs"
                            >
                                {(track.millis / 1000).toString().toHHMMSS()}
                            </Text>
                        </EntypoNB>

                        {
                            track.favorite ? (
                                <AntDesignNB
                                    name="star"
                                    color="yellow.300" />
                            ) : (<></>)
                        }

                        <PlatformIcon platform={track.platform} />
                    </HStack>
                </VStack>

                {
                    !selectionMode ? (
                        <Pressable onPress={handleSettingsButton} justifyContent="center">
                            <EntypoNB mr="2" py="4"
                                alignSelf="center"
                                color="primary.50"
                                name="dots-three-vertical" 
                                fontSize={20}/>
                        </Pressable>
                    ) : (
                        <Checkbox my="auto" p="1" mr="4"
                            aria-label="track selection checkbox"
                            bg="gray.500"
                            borderWidth="0"
                            isChecked={isSelected}
                            onChange={handleSelection}/>
                    )
                }
            </HStack>

            <TrackSettingsSheet
                navigation={navigation}
                payload={{playlistId, track}}
                discloseObject={disclose}/>
        </Pressable>
    );
};


export default memo(TrackElement)
