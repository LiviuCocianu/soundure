import React from 'react';
import { Box, Text, ScrollView } from 'native-base';
import PlaylistElement from './PlaylistElement';
import { useSelector } from 'react-redux';

const PlaylistsCategory = () => {
    const data = useSelector(state => state.playlists);

    return (
        <Box bg="primary.900"
          w="90%" h="350" 
          mt="6"
          rounded="2xl"
          alignItems="center"
          flex="1"
          flexGrow="0"
        >
          <Box mt="4" alignItems="center" justifyContent="center" flex="0.2">
            <Text color="white" fontFamily="quicksand_b" fontSize="lg">Începe să asculți!</Text>
            <Text color="white" fontFamily="manrope_l" fontSize="sm">Alege un playlist</Text>
          </Box>

          <ScrollView 
            w="90%" mt="4"
            _contentContainerStyle={{flexGrow: 1}} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            flex="0.8"
          >
            {data.map((item) => <PlaylistElement playlistID={item.id} key={item.id}/>)}
          </ScrollView>
        </Box>
    );
};

export default PlaylistsCategory;
