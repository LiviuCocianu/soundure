import React from 'react';
import { Box, AspectRatio, Factory, Pressable } from 'native-base';
import MarqueeText from 'react-native-marquee'
import { ImageBackground } from 'react-native';

const HorizontalCategoryElement = ({
    title="Titlu playlist",
    cover=require("../../../../assets/icon/icon.png"),
    color="primary.100",
    onPress
}) => {
    const MarqueeTextNB = Factory(MarqueeText);
    const ImageNB = Factory(ImageBackground);

    return (
        <Pressable
            _pressed={{ opacity: 80 }}
            onPress={onPress}
        >
            <Box mr="2" rounded="xl">
                <AspectRatio ratio="2/2" flexGrow="1">
                    <ImageNB 
                        w="100%" h="100%" mr="2"
                        source={cover}
                        bg={color}
                        justifyContent="flex-end"
                        rounded="xl"
                        imageStyle={{ borderRadius: 15 }}
                    >
                        <Box w="100%" h="25%" overflow="hidden" justifyContent="center">
                            <Box w="100%" h="100%" bg="black" opacity="50" position="absolute"/>
                            <MarqueeTextNB
                                ml="2"
                                color="white"
                                fontFamily="manrope_r"
                                fontSize="10"
                                numberOfLines={1}
                                speed={0.5}
                            >
                                {title}
                            </MarqueeTextNB>
                        </Box>
                    </ImageNB>
                </AspectRatio>
            </Box>
        </Pressable>
    );
};

export default HorizontalCategoryElement;
