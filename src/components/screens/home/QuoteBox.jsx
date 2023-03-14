import React, { useState, useEffect, useRef } from 'react'
import { ImageBackground, Animated } from 'react-native'
import { Box, Pressable, Text } from 'native-base'


/**
 * QuoteBox component
 * 
 * @returns {JSX.Element} JSX component
 */
const QuoteBox = () => {
  const bannerDarkURI = require("../../../../assets/images/soundure_banner_dark.png");
  const progress = useRef(new Animated.Value(0)).current;

  const [quote, setQuote] = useState("There's nothing like music to relieve the soul and uplift it.");
  const [author, setAuthor] = useState("Mickey Hart");
  const [generated, setGenerated] = useState(false);

  const getQuote = async () => {
    const url = "https://api.api-ninjas.com/v1/quotes?category=inspirational"

    if (!generated) {
      await fetch(url, { headers: { "X-Api-Key": QUOTE_API_KEY } })
        .then(res => res.json())
        .then(res => {
          const quote = res[0].quote > 75 
                        ? quote.slice(0, 70) + "..." 
                        : res[0].quote;

          setQuote(quote);
          setAuthor(res[0].author);
          setGenerated(true);
        });
    }
  }

  useEffect(() => {
    // TODO add fetch timestamp to database to check if quote was already fetched for the day
    //getQuote();

    Animated.timing(progress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Box w="100%" h="150" position="absolute">
      <Pressable>
        <ImageBackground h="100%"
          source={bannerDarkURI}
          alt="quotecover"
          resizeMode="cover"
        >
          <Box w="100%" h="100%"
            bg="black"
            position="absolute"
            opacity="50"/>

          <Animated.View style={{ opacity: progress }}>
            <Box w="100%" h="100%" px="10"
              justifyContent="center"
              alignItems="center"
            >
              <Text color="white"
                fontFamily="quicksand_b"
                fontSize="xl">Citatul zilei!</Text>

              <Text color="white"
                fontFamily="manrope_li">"{quote}"</Text>

              <Text color="white"
                fontFamily="manrope_m"
                alignSelf="flex-end">- {author}</Text>
            </Box>
          </Animated.View>
        </ImageBackground>
      </Pressable>
    </Box>
  )
}

export default QuoteBox