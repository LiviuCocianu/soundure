import React from 'react'
import { ImageBackground } from 'react-native'
import { Box, AspectRatio, Factory, Pressable } from 'native-base'

import MarqueeText from 'react-native-marquee'


/**
 * @callback onPress
 */

/**
 * HorizontalCategoryElement component
 * 
 * @param {object} params params object
 * @param {string} params.title Playlist title
 * @param {onPress} params.onPress Callback on element press
 * @param {any} [params.cover] The playlist cover. Possible values:
 * 
 *                             cover = require(URI) - Reference a local image (default value)
 *
 *                             cover = {uri: URI} - Reference an external image
 * @param {string} [params.color] Background color of element, only if the cover is not available
 * 
 * @returns {JSX.Element} JSX component
 */
const HorizontalCategoryElement = ({
    title="Titlu playlist",
    onPress,
    cover=require("../../../assets/icon/icon.png"),
    color="primary.100",
}) => {
    const MarqueeTextNB = Factory(MarqueeText);
    const ImageNB = Factory(ImageBackground);

    return (
        <Pressable _pressed={{ opacity: 80 }} onPress={onPress}>
            <Box mr="2" rounded="xl">
                <AspectRatio flexGrow="1" ratio="2/2">
                    <ImageNB w="100%" h="100%" mr="2"
                        source={cover}
                        bg={color}
                        justifyContent="flex-end"
                        rounded="xl"
                        imageStyle={{ borderRadius: 15 }}
                    >
                        <Box w="100%" h="25%" 
                            overflow="hidden" 
                            justifyContent="center"
                        >
                            <Box w="100%" h="100%" 
                                bg="black" 
                                opacity="50" 
                                position="absolute"/>

                            <MarqueeTextNB ml="2"
                                color="white"
                                fontFamily="manrope_r"
                                fontSize="10"
                                numberOfLines={1}
                                speed={0.5}>{title}</MarqueeTextNB>
                        </Box>
                    </ImageNB>
                </AspectRatio>
            </Box>
        </Pressable>
    );
};

export default HorizontalCategoryElement
