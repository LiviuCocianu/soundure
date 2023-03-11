import { Box, Button, ScrollView, Icon } from 'native-base'
import React, { useState } from 'react'
import QuoteBox from './QuoteBox'
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFolderPlus, faPlus } from '@fortawesome/free-solid-svg-icons';
import PlaylistsCategory from './PlaylistsCategory';
import HistoryCategory from './HistoryCategory';
import FavoriteCategory from './FavoriteCategory';
import CreatePlaylist from '../../modals/CreatePlaylist';
import UploadTrack from '../../modals/UploadTrack';

const HomePage = ({db}) => {
  const [createModalOpened, toggleCreateModal] = useState(false);
  const [uploadModalOpened, toggleUploadModal] = useState(false);

  const HeaderButton = ({text, icon, onPress}) => (
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
      onPress={onPress}
    >{text}</Button>
  )

  return (
    <ScrollView w="100%" h="100%" 
      _contentContainerStyle={{flexGrow: 1}}
    >
      {/* Modals */}
      <CreatePlaylist 
        isOpen={createModalOpened} 
        closeHandle={toggleCreateModal}
        db={db}
      />
      <UploadTrack
        isOpen={uploadModalOpened}
        closeHandle={toggleUploadModal}
        db={db}
      />

      <QuoteBox/>
      <Box w="100%" h="100%" 
        mt="140" pb="10"
        bg="black"
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
          <HeaderButton text="Creează playlist" icon={faFolderPlus} onPress={() => toggleCreateModal(true)}/>
          <HeaderButton text="Adaugă o piesă" icon={faPlus} onPress={() => toggleUploadModal(true)}/>
        </Box>

        <PlaylistsCategory db={db}/>
        <HistoryCategory db={db}/>
        <FavoriteCategory/>
      </Box>
    </ScrollView>
  )
}

export default HomePage