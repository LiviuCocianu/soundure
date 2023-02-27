import { Box, Button, ScrollView, Text, Icon } from 'native-base'
import React from 'react'
import QuoteBox from './QuoteBox'
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFolderPlus, faPlus } from '@fortawesome/free-solid-svg-icons';
import PlaylistsCategory from './PlaylistsCategory';
import HistoryCategory from './HistoryCategory';

const HomePage = () => {
  const HeaderButton = ({text, icon}) => (
    <Button 
      bg="transparent" 
      borderColor="white" 
      borderWidth="1" 
      borderRadius="lg"
      _text={{
        fontFamily: "quicksand_r"
      }}
      _ios={{
        _pressed: {
          bg: "primary.500:alpha.40"
        }
      }}
      android_ripple={{
        color: "primary.50"
      }}
      leftIcon={<Icon as={FontAwesomeIcon} icon={icon} color="primary.500"></Icon>}
      size="sm"
    >{text}</Button>
  )

  return (
    <ScrollView w="100%" h="100%" _contentContainerStyle={{flexGrow: 1}}>
      <QuoteBox/>
      <Box bg={{
          linearGradient: {
            colors: ["black", "primary.900"],
            start: [0, 0],
            end: [0, 1]
          }
        }} 
        w="100%" 
        h="100%" 
        mt="140"
        pb="10"
        borderTopLeftRadius="2xl" 
        borderTopRightRadius="2xl" 
        zIndex={5}
        alignItems="center"
      >
        <Box w="90%" h="50" 
          mt="6" 
          flex="1" 
          flexGrow="0" 
          flexDir="row" 
          justifyContent="space-around"
        >
          <HeaderButton text="Creează playlist" icon={faFolderPlus}/>
          <HeaderButton text="Adaugă o piesă" icon={faPlus}/>
        </Box>

        <PlaylistsCategory/>
        <HistoryCategory/>
      </Box>
    </ScrollView>
  )
}

export default HomePage