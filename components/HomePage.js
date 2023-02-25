import { Box, ScrollView } from 'native-base'
import React from 'react'
import QuoteBox from './QuoteBox'

const HomePage = () => {
  return (
    <ScrollView w="100%" h="100%" _contentContainerStyle={{flexGrow: 1}}>
      <QuoteBox/>
      <Box bg={{
        linearGradient: {
          colors: ["black", "primary.50"],
          start: [0, 0],
          end: [0, 1]
        }
        }} 
        w="100%" 
        h="100%" 
        borderTopLeftRadius="2xl" 
        borderTopRightRadius="2xl" 
        zIndex={5}
        mt="140"
      >

      </Box>
    </ScrollView>
  )
}

export default HomePage