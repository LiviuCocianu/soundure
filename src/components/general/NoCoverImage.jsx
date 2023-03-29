import React from 'react'
import { ImageBackground } from 'react-native'
import { Box, Factory, Text } from 'native-base'


/**
 * NoCoverImage component
 * 
 * @param {object} props Props object. Can take utility-first props from NativeBase
 * 
 * @returns {JSX.Element} JSX component
 */
const NoCoverImage = (props) => {
    const ImageNB = Factory(ImageBackground);
    const coverImageStyle = {height: "100%", borderRadius: props.borderRadius};
    const bannerDarkURI = require("../../../assets/images/soundure_banner_dark.png");

    const {h, height, ...filteredProps} = props;

    return (
        <ImageNB 
            w="100%" 
            imageStyle={coverImageStyle} 
            source={bannerDarkURI}
            resizeMode="cover"
            {...props}
        >
            <Box 
                w="100%" h="100%"
                justifyContent="center"
                alignItems="center"
            >
                <Box w="100%" h="100%" 
                    position="absolute" 
                    bg="black" 
                    opacity="50" 
                    {...filteredProps}/>

                <Text position="absolute" 
                    color="gray.400" 
                    fontFamily="manrope_m" 
                    fontSize="2xl">Fără copertă</Text>
            </Box>
        </ImageNB>
    );
};

export default NoCoverImage
