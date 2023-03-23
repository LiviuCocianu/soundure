import React, { useCallback, useState } from 'react';
import { Dimensions } from 'react-native';
import { Box, HStack, Factory, Text, FlatList, Button } from 'native-base';
import { StackActions } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import TrackElement from '../playlist/TrackElement';

import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import NoContentInfo from '../../general/NoContentInfo';
import { TRACK_EL_HEIGHT } from '../../../constants';


const FeatherNB = Factory(Feather);
const MaterialNB = Factory(MaterialIcons);
const MaterialComNB = Factory(MaterialCommunityIcons);

/**
 * TrackListPage component
 * 
 * @param {object} props props object
 * @param {object} props.navigation React Navigation object
 * @param {object} props.route Route object used for passing data between screens
 * 
 * @returns {JSX.Element} JSX component
 */
const TrackListPage = ({ navigation, route }) => {
    const payload = route.params.payload;
    const screenW = Dimensions.get("screen").width;

    const tracks = useSelector(state => state.tracks);
    const [selectedIDs, setSelectedIDs] = useState(new Set());
    const [areAllSelected, setAllSelected] = useState(false);

    const handleHomeNav = () => {
        navigation.popToTop();
    }

    const handleSelection = (isSelected, trackId) => {
        const set = new Set();
        selectedIDs.forEach(el => set.add(el));

        if(isSelected) {
            if(trackId) set.add(trackId);
            else tracks.forEach(tr => selectedIDs.add(tr.id));
        } else {
            if(trackId) set.delete(trackId);
            else set.clear();
        }

        setSelectedIDs(set);
    }

    const renderItem = useCallback(({item}) => (
        <TrackElement w={screenW}
            trackId={item.id}
            selectionMode={true}
            allSelected={areAllSelected}
            selectionHandler={handleSelection}
            key={item.id}/>
    ))

    const getItemLayout = useCallback((data, index) => ({
        length: TRACK_EL_HEIGHT,
        offset: TRACK_EL_HEIGHT * index,
        index
    }))

    const handleSubmit = () => {

    }

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

                <HStack h="100%" ml="auto" mr="4"
                    alignItems="center"
                    justifyContent="center"
                >
                    <MaterialNB mr="2"
                        onPress={() => setAllSelected(true)}
                        name="select-all"
                        color="white"
                        accessibilityLabel="select all button"
                        fontSize={30}/>

                    <MaterialComNB
                        onPress={() => setAllSelected(false)}
                        name="select-remove"
                        color="white"
                        accessibilityLabel="deselect all button"
                        fontSize={30}/>
                </HStack>
            </HStack>

            {
                tracks.length == 0 ? (
                    <NoContentInfo
                        onPress={handleHomeNav}
                        title="Hmm ceva lipsește.. oare ce?"
                        subtitle={<><Text underline>Navighează</Text> înapoi către pagina de pornire și adaugă câteva piese</>}/>
                ) : (
                    <FlatList w="100%" h="84%" mt="1"
                        data={tracks}
                        initialNumToRender={7}
                        maxToRenderPerBatch={7}
                        getItemLayout={getItemLayout}
                        renderItem={renderItem}/>
                )
            }

            <Box w="100%" h="20" 
                position="absolute"
                bottom="0"
                alignItems="center"
                justifyContent="center"
            >
                <Button minW="50%" maxW="90%" h="10"
                    onPress={handleSubmit}
                    isDisabled={selectedIDs.size == 0}
                    bg="primary.500"
                    borderRadius="lg"
                >
                    <Text
                        color="white"
                        fontFamily="quicksand_b"
                    >Adaugă {selectedIDs.size} {selectedIDs.size == 1 ? "piesă" : "piese"}</Text>
                </Button>
            </Box>
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
                    fontSize={30}
                    shadow={5}/>
            </HStack>
        </Box>
    )
};

export default TrackListPage
