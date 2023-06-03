import React, { useEffect, useRef } from 'react'
import { StyleSheet, Dimensions, Animated } from 'react-native'
import { Box, Image } from 'native-base'


/**
 * LoadingPage component
 * 
 * @returns {JSX.Element} JSX component
 */
const LoadingPage = ({
    background = "black"
}) => {
    const size = Dimensions.get("screen").width * 0.6;
    const logoWhiteURI = require("../../../../assets/images/soundure_logo_white.png");
    const progress = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(progress, {
                    toValue: 0.2,
                    useNativeDriver: true,
                    duration: 1000,
                }),
                Animated.timing(progress, {
                    toValue: 1,
                    useNativeDriver: true,
                    duration: 1000,
                })
            ])
        ).start();
    }, []);

    return (
        <Box
            bg={background}
            flex={1}
            justifyContent="center"
            alignItems="center"
            zIndex={100}
            style={{ ...StyleSheet.absoluteFillObject }}
        >
            <Animated.View style={{ opacity: progress }}>
                <Image w={size} h={size}
                    source={logoWhiteURI}
                    alt="homelogo" />
            </Animated.View>
        </Box>
    )
};

export default LoadingPage