import React, { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, Animated } from 'react-native'
import { Box, Image } from 'native-base'

const LoadingPage = () => {
  const size = Dimensions.get("screen").width * 0.6;
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
    <Box flex={1} 
      bg="black" 
      style={{...StyleSheet.absoluteFillObject}}
      justifyContent="center"
      alignItems="center"
    >
      <Animated.View style={{opacity: progress}}>
        <Image
          source={require("../assets/images/sondure_logo_white.png")}
          alt="home logo"
          w={size}
          h={size}
        />
      </Animated.View>
    </Box>
  )
};

export default LoadingPage;