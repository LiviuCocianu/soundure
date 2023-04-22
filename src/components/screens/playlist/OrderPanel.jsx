import React from 'react'
import { Box, Factory } from 'native-base'

import { AntDesign } from '@expo/vector-icons'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


const AntDesignNB = Factory(AntDesign);

// TODO document this
const OrderPanel = () => {
    const animValue = useSharedValue(-50);
    const animStyle = useAnimatedStyle(() => ({
        transform: `translateX(${animValue.value})`
    }));


    return (
        <Box w={50} h="100%"
            position="absolute"
            right="0" top="24"
            zIndex={10}
        >
            <Animated.View style={{
                width: 50,
                height: 100,
                ...animStyle
            }}>
                <Box bg="black"
                    borderWidth={1}
                    borderColor="gray.400"
                    borderBottomLeftRadius="lg"
                >
                    <Box w={30} h={50}
                        position="relative"
                        left={-29}
                        zIndex={11}
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
                </Box>
            </Animated.View>
        </Box>
    )
}




export default OrderPanel