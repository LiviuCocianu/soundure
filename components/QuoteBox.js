import React, { useState, useEffect } from 'react'
import { Box, Pressable, Text } from 'native-base'
import { ImageBackground } from 'react-native'

const QuoteBox = () => {
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
          setQuote(res[0].quote);
          setAuthor(res[0].author);
          setGenerated(true);
        });
    }
  }

  useEffect(() => {
    //getQuote();
  }, []);

  return (
    <Box w="100%" h="150" position="absolute">
      <Pressable onPress={() => console.log("test")}>
        <ImageBackground
          source={require("../assets/images/soundure_banner_dark.png")}
          alt="quotecover"
          resizeMode="cover"
          h="100%"
        >
          <Box w="100%" h="100%" justifyContent="center" alignItems="center" px="10">
            <Text color="white" fontFamily="quicksand_b" fontSize="xl">Citatul zilei!</Text>
            <Text color="white" fontFamily="manrope_li">"{quote}"</Text>
            <Text color="white" fontFamily="manrope_m" alignSelf="flex-end">- {author}</Text>
          </Box>
        </ImageBackground>
      </Pressable>
    </Box>
  )
}

export default QuoteBox