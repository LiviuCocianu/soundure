import React, { useState, useEffect, useRef } from 'react'
import { Box, Pressable, Text } from 'native-base'
import { ImageBackground, Animated } from 'react-native'

const QuoteBox = () => {
  const progress = useRef(new Animated.Value(0)).current;
  const [quote, setQuote] = useState("There's nothing like music to relieve the soul and uplift it.");
  const [author, setAuthor] = useState("Mickey Hart");
  const [generated, setGenerated] = useState(false);

  const getQuote = async () => {
    const url = "https://api.api-ninjas.com/v1/quotes?category=inspirational"

    if (!generated) {
      await fetch(url, {
          headers: {
            "X-Api-Key": QUOTE_API_KEY
          }
        }).then(res => res.json())
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
    //getQuote();

    Animated.timing(progress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Box w="100%" h="150" position="absolute">
      <Pressable onPress={() => console.log("test")}>
        <ImageBackground
          h="100%"
          source={require("../../../assets/images/soundure_banner_dark.png")}
          alt="quotecover"
          resizeMode="cover"
        >
          <Box w="100%" h="100%" position="absolute" bg="black" opacity="50"></Box>
          <Animated.View style={{opacity: progress}}>
            <Box w="100%" h="100%" px="10" justifyContent="center" alignItems="center">
              <Text color="white" fontFamily="quicksand_b" fontSize="xl">Citatul zilei!</Text>
              <Text color="white" fontFamily="manrope_li">"{quote}"</Text>
              <Text color="white" fontFamily="manrope_m" alignSelf="flex-end">- {author}</Text>
            </Box>
          </Animated.View>
        </ImageBackground>
      </Pressable>
    </Box>
  )
}

export default QuoteBox