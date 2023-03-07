import React, { useState, useEffect } from 'react';
import { Box, Text, ScrollView } from 'native-base';
import PlaylistElement from './PlaylistElement';

const PlaylistsCategory = ({db}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
      db.select("Playlist", "*").then(setData);
    }, []);

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
            {data.map((item) => <PlaylistElement data={item} key={item.id}/>)}
          </ScrollView>
        </Box>
    );
};

export default PlaylistsCategory;
