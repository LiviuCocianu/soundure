import React from 'react'
import { Box, Pressable, AspectRatio, Text, Image } from "native-base";

/**
 * @callback onPress
 */

/**
 * NoContentInfo component
 * 
 * @param {object} props props object
 * @param {onPress} props.onPress Callback to execute on component press 
 * @param {string|JSX.Element} [props.title] Content title
 * @param {string|JSX.Element} [props.subtitle] Content subtitle
 * 
 * @returns {JSX.Element} JSX component
 */
const NoContentInfo = ({
    onPress,
    title="Cam pustiu pe aici...",
    subtitle=""
}) => {
    const unavailableURI = require("../../../assets/images/soundure_unavailable_white.png");

    return (
        <Pressable w="100%" h="100%" 
            onPress={onPress}
            flex="1"
            justifyContent="center"
            alignItems="center"
        >
            <Box w="auto" h="auto"
                justifyContent="center"
                alignItems="center">
                <AspectRatio ratio="4/4" h="40%">
                    <Image w="100%" h="100%"
                        opacity={0.5}
                        source={unavailableURI}
                        alt="no tracks in playlist"/>
                </AspectRatio>

                <Text mb="2"
                    color="white"
                    fontFamily="quicksand_b"
                    fontSize="lg"
                    opacity={0.5}>{title}</Text>

                <Box w="80%">
                    <Text color="white"
                        textAlign="center"
                        fontFamily="quicksand_r"
                        fontSize="sm"
                        opacity={0.5}>{subtitle}</Text>
                </Box>
            </Box>
        </Pressable>
    );
}


export default NoContentInfo