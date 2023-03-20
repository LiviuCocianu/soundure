import React from 'react';
import { Dimensions } from 'react-native';
import { Box, HStack, Factory, Text, FlatList } from 'native-base';
import { StackActions } from '@react-navigation/native';

import TrackElement from '../playlist/TrackElement';

import { Feather } from '@expo/vector-icons'; 
import { useSelector } from 'react-redux';


const FeatherNB = Factory(Feather);

const TrackListPage = ({ route }) => {
    const payload = route.params.payload;
    const screenW = Dimensions.get("screen").width;
    const tracks = useSelector(state => state.tracks);

    return (
        <Box w="100%" h="100%"
            bg={{
                linearGradient: {
                    colors: ["gray.800", "black"],
                    start: [0.5, 0],
                    end: [0.5, 1]
                }
            }}
        >
            <HStack w="100%" h="16%" pl="6" pt="12"
                bg={{
                    linearGradient: {
                        colors: ["primary.900", "primary.500"],
                        start: [0.5, 0],
                        end: [0.5, 1]
                    }
                }}
            >
                <Box h="100%" justifyContent="center">
                    <Text color="white"
                        fontFamily="quicksand_b"
                        fontSize="lg">Alege piese</Text>
                </Box>
            </HStack>

            <FlatList w="100%" h="84%" mt="1"
                data={tracks}
                renderItem={({item}) => <TrackElement trackId={item.id} w={screenW} key={item.id}/>}/>
        </Box>
    );
};


export const TrackListHeader = ({ navigation, route }) => {
    const payload = route.params.payload;

    const handleBack = () => {
        navigation.dispatch(StackActions.pop());
    }

    return (
        <Box w="100%">
            <HStack h="16" alignItems="center">
                <FeatherNB h="auto" ml="4"
                    onPress={handleBack}
                    color="primary.50"
                    name="arrow-left"
                    fontSize={40}
                    shadow={5}/>
            </HStack>
        </Box>
    )
};

export default TrackListPage;
