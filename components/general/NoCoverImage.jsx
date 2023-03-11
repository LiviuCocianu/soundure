import React from 'react';
import { Box, Factory, Text } from 'native-base';
import { ImageBackground } from 'react-native';

const NoCoverImage = (props) => {
    const ImageNB = Factory(ImageBackground);

    return (
        <ImageNB 
            w="100%"
            imageStyle={{height: "100%", borderRadius: props.borderRadius}}
            source={require("../../assets/images/soundure_banner_dark.png")}
            resizeMode="cover"
            {...props}
        >
            <Box 
                w="100%" h="100%"
                justifyContent="center"
                alignItems="center"
            >
                <Box {...props} w="100%" h="100%" position="absolute" bg="black" opacity="50"/>
                <Text 
                    position="absolute" 
                    color="gray.400" 
                    fontFamily="manrope_m" 
                    fontSize="2xl"
                >Fără copertă</Text>
            </Box>
        </ImageNB>
    );
};

export default NoCoverImage;
