import React from 'react';
import { StyleSheet, Dimensions } from 'react-native'
import { Box, Image } from 'native-base'
import LottieView from 'lottie-react-native'

const LoadingPage = () => {
  const size = Dimensions.get("screen").width * 0.6;

  return (
    <Box flex={1} 
      bg="black" 
      style={{...StyleSheet.absoluteFillObject}}
      justifyContent="center"
      alignItems="center"
    >
      <Image
        source={require("../assets/images/sondure_logo_white.png")}
        alt="home logo"
        w={size}
        h={size}
      />
    </Box>
  )
};

export default LoadingPage;