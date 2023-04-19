import React, { useState, useRef, useMemo } from 'react';
import { Box, HStack, Factory, Text, Button } from 'native-base';

import { StackActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import Toast from 'react-native-root-toast';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 

import OptimizedTrackList from '../../general/OptimizedTrackList';
import { playlistContentAdded } from "../../../redux/slices/playlistContentSlice"
import db from "../../../database/database"
import { PlaylistBridge } from '../../../database/componentBridge';


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
    const payload = route.params.payload; // Playlist info from database

    const tracks = useSelector(state => state.tracks);
    const playlistsContent = useSelector(state => state.playlistsContent);
    const dispatch = useDispatch();
    
    let selectedIDs = useRef(new Set()).current;
    const [areAllSelected, setAllSelected] = useState(false);

    const ownTracks = useMemo(() => {
        const ownIDs = playlistsContent
            .filter(pc => pc.playlistId == payload.id)
            .map(pc => pc.trackId);

        return tracks.filter(tr => !ownIDs.includes(tr.id)).map(tr => tr.id);
    }, [playlistsContent]);

    const handleHomeNav = () => {
        navigation.popToTop();
    }

    const handleBack = () => {
        navigation.dispatch(StackActions.pop());
    }

    const handleSelection = (isSelected, trackId) => {
        const set = new Set();
        selectedIDs.forEach(el => set.add(el));

        if(isSelected) {
            if(trackId) set.add(trackId);
            else {
                ownTracks.forEach(tr => selectedIDs.add(tr));
                set.clear();
                selectedIDs.forEach(el => set.add(el));
            }
        } else {
            if(trackId) set.delete(trackId);
            else set.clear();
        }

        selectedIDs = set;
    }

    const handleSubmit = () => {
        if(selectedIDs.size > 0) {
            PlaylistBridge.linkTracks(
                tracks
                    .filter(tr => selectedIDs.has(tr.id))
                    .map(tr => ({ trackId: tr.id, playlistId: payload.id })),
                dispatch
            ).then(handleBack);
        } else {
            Toast.show("Selectează câteva piese mai întâi", {
                position: Toast.positions.CENTER
            });
        }
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
                        color={!areAllSelected ? "white" : "gray.400"}
                        accessibilityLabel="select all button"
                        fontSize={30}/>

                    <MaterialComNB
                        onPress={() => setAllSelected(false)}
                        name="select-remove"
                        color={areAllSelected ? "white" : "gray.400"}
                        accessibilityLabel="deselect all button"
                        fontSize={30}/>
                </HStack>
            </HStack>

            <OptimizedTrackList
                navigation={navigation}
                ownTracks={ownTracks}
                onInfoPress={handleHomeNav}
                selection={{
                    enabled: true,
                    areAllSelected,
                    selectionHandler: handleSelection
                }}/>

            <Button w="50%" h="10" mb="5"
                onPress={handleSubmit}
                position="absolute"
                bottom="24"
                alignSelf="center"
                bg="primary.500"
                borderRadius="lg"
                _text={{
                    color: "white",
                    fontFamily: "quicksand_b"
                }}
            >Adaugă</Button>
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
