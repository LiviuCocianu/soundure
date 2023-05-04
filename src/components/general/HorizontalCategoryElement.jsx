import React, { memo } from 'react'
import { ImageBackground } from 'react-native'
import { Box, AspectRatio, Factory, Pressable } from 'native-base'

import MarqueeText from 'react-native-marquee'

import { handleCoverURI } from '../../functions';


const MarqueeTextNB = Factory(MarqueeText);
const ImageNB = Factory(ImageBackground);

/**
 * @callback onPress
 */

/**
 * HorizontalCategoryElement component
 * 
 * @param {object} params params object
 * @param {string} params.title Playlist title
 * @param {onPress} params.onPress Callback on element press
 * @param {any} [params.coverURI] The playlist cover. Possible values:
 * 
 *                             coverURI = require(URI) - Reference a local image (default value)
 *
 *                             coverURI = {uri: URI} - Reference an external image
 * @param {string} [params.placeholderColor] Background color of element, only if the cover is not available
 * 
 * @returns {JSX.Element} JSX component
 */
const HorizontalCategoryElement = ({
    title="Titlu playlist",
    onPress,
    coverURI,
    placeholderColor="primary.50"
}) => {
    return (
        <Pressable _pressed={{ opacity: 80 }} onPress={onPress}>
            <Box mr="2" rounded="xl">
                <AspectRatio flexGrow="1" ratio="2/2">
                    <ImageNB w="100%" h="100%" mr="2"
                        source={handleCoverURI(coverURI)}
                        bg={placeholderColor}
                        justifyContent="flex-end"
                        rounded="xl"
                        imageStyle={{ borderRadius: 10 }}
                    >
                        <Box w="100%" h="25%" 
                            overflow="hidden" 
                            justifyContent="center"
                        >
                            <Box w="100%" h="100%" 
                                bg="black" 
                                borderBottomLeftRadius={10}
                                borderBottomRightRadius={10}
                                opacity="50" 
                                position="absolute"/>

                            <MarqueeTextNB ml="2"
                                color="white"
                                fontFamily="manrope_r"
                                fontSize="10"
                                numberOfLines={1}
                                style={{
                                    textShadowRadius: 5,
                                    textShadowColor: 'black',
                                    textShadowOffset: { width: 1, height: 2 }
                                }}
                                speed={0.4}>{title}</MarqueeTextNB>
                        </Box>
                    </ImageNB>
                </AspectRatio>
            </Box>
        </Pressable>
    );
};


export default memo(
    HorizontalCategoryElement,
    (prev, next) => prev.title == next.title 
        && prev.coverURI == next.coverURI
        && prev.placeholderColor == next.placeholderColor
        && prev.onPress == next.onPress
);
