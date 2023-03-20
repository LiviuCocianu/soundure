import React from 'react'
import { Box, Text, ScrollView } from 'native-base'

import { useSelector } from 'react-redux'

import PlaylistElement from '../PlaylistElement'
import { RESERVED_PLAYLISTS } from '../../../../constants'


/**
 * @callback navigateToPlaylist
 * @param {object} playlistObj Object containing information about the playlist
 */

/**
 * PlaylistsCategory component
 * 
 * @param {object} props props object
 * @param {navigateToPlaylist} props.navigateToPlaylist Callback for navigating 
 *                             to the playlist page when a playlist element
 *                             is pressed
 * 
 * @returns {JSX.Element} JSX component
 */
const PlaylistsCategory = ({ navigateToPlaylist }) => {
    const data = useSelector(state => state.playlists);
    const renderContent = data.map(item => {
      if(RESERVED_PLAYLISTS.includes(item.title)) return;

      return <PlaylistElement 
                playlistID={item.id}
                navigateToPlaylist={navigateToPlaylist} 
                key={item.id}/>;
    });

    return (
        <Box w="90%" h="350" mt="6"
          flex="1"
          flexGrow="0"
          alignItems="center"
          bg="primary.900"
          rounded="2xl"
        >
          <Box mt="4"
            flex="0.2"
            justifyContent="center"
            alignItems="center" 
          >
            <Text 
              color="white" 
              fontFamily="quicksand_b" 
              fontSize="lg">Începe să asculți!</Text>

            <Text 
              color="white"
              fontFamily="manrope_l"
              fontSize="sm">Alege un playlist</Text>
          </Box>

          <ScrollView w="90%" mt="4"
            flex="0.8"
            _contentContainerStyle={{flexGrow: 1}} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled>{renderContent}</ScrollView>
        </Box>
    );
};

export default PlaylistsCategory
