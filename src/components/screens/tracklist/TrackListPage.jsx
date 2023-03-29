import React, { useState, useRef } from 'react';
import { Dimensions } from 'react-native';
import { Box, HStack, Factory, Text, FlatList, Button } from 'native-base';
import { StackActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import Toast from 'react-native-root-toast';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 

import TrackElement from '../playlist/TrackElement';

import { playlistContentAdded } from "../../../redux/slices/playlistContentSlice"
import NoContentInfo from '../../general/NoContentInfo';
import { TRACK_EL_HEIGHT } from '../../../constants';
import db from "../../../database/database"
import { useEffect } from 'react';


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
    const screenW = Dimensions.get("screen").width;

    const tracks = useSelector(state => state.tracks);
    const playlistsContent = useSelector(state => state.playlistsContent);
    const dispatch = useDispatch();
    
    const [ownTracks, setOwnTracks] = useState([]);
    const [areAllSelected, setAllSelected] = useState(false);
    let selectedIDs = useRef(new Set()).current;

    useEffect(() => {
        const ownIDs = playlistsContent
            .filter(pc => pc.playlistId == payload.id)
            .map(pc => pc.trackId);

        setOwnTracks(tracks.filter(tr => !ownIDs.includes(tr.id)));
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
            else tracks.forEach(tr => selectedIDs.add(tr.id));
        } else {
            if(trackId) set.delete(trackId);
            else set.clear();
        }

        selectedIDs = set;
    }

    const renderItem = ({item}) => (
        <TrackElement w={screenW}
            trackId={item.id}
            playlistId={payload.id}
            selectionMode={true}
            allSelected={areAllSelected}
            selectionHandler={handleSelection}
            key={item.id}/>
    );

    const getItemLayout = (data, index) => ({
        length: TRACK_EL_HEIGHT,
        offset: TRACK_EL_HEIGHT * index,
        index
    });

    const handleSubmit = () => {
        if(selectedIDs.size > 0) {
            db.insertBulkInto("PlaylistContent", tracks
                .filter(tr => selectedIDs.has(tr.id))
                .map(tr => ({ trackId: tr.id, playlistId: payload.id }))
            ).then(rsArr => {
                rsArr.forEach(rs => {
                    const payl = rs.payload;
                    dispatch(playlistContentAdded({ id: rs.insertId, ...payl }));
                });
            }).then(() => {
                handleBack();
                Toast.show("Piesele au fost adăugate!", {
                    duration: Toast.durations.LONG,
                    delay: 500
                });
            });
        } else {
            Toast.show("Selectează câteva piese mai întâi", {
                duration: Toast.durations.LONG,
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

            {
                tracks.length == 0 ? (
                    <NoContentInfo
                        onPress={handleHomeNav}
                        title="Hmm ceva lipsește.. oare ce?"
                        subtitle={<><Text underline>Navighează</Text> înapoi către pagina de pornire și adaugă câteva piese</>}/>
                ) : (
                    <FlatList w="100%" h="84%" mt="1"
                        data={ownTracks}
                        initialNumToRender={7}
                        maxToRenderPerBatch={7}
                        getItemLayout={getItemLayout}
                        renderItem={renderItem}/>
                )
            }

            <Button w="50%" h="10" mb="5"
                onPress={handleSubmit}
                position="absolute"
                bottom="0"
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
