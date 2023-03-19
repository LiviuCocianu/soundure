import React, { useEffect, useState } from 'react'
import { ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { Box, Factory, HStack, Text, FlatList, Actionsheet, useDisclose } from 'native-base'

import { StackActions } from "@react-navigation/native"
import { Feather, Entypo } from '@expo/vector-icons'; 
import { useSelector } from 'react-redux';

import { handleCoverURI, playlistStatsString } from '../../../functions';
import TrackElement from './TrackElement';


const ImageNB = Factory(ImageBackground);
const FeatherNB = Factory(Feather);
const EntypoNB = Factory(Entypo);

/**
 * PlaylistPage component
 * 
 * @returns {JSX.Element} JSX component
 */
const PlaylistPage = ({ route }) => {
    const payload = route.params.payload;
    const screenW = Dimensions.get("screen").width;

    const [textHeight, setTextHeight] = useState(0);
    const playlistsContent = useSelector(state => state.playlistsContent);
    const [ownTracks, setOwnTracks] = useState([]); // List of IDs

    useEffect(() => {
        setOwnTracks(playlistsContent
            .filter(link => link.playlistId == payload.id)
            .map(link => link.trackId));
    }, [playlistsContent]);

    return (
        <Box w="100%" h="100%"
            bg="black"
        >
            <Box w="100%" h="35%">
                <ImageNB w="100%" h="100%"
                    source={handleCoverURI(payload.coverURI)}
                    imageStyle={{ height: "100%" }}/>

                <Box w="100%" h="100%" style={{...StyleSheet.absoluteFillObject}}>
                    <Box w="100%" h="100%"
                        bg={{
                            linearGradient: {
                                colors: ["black", "transparent", "transparent", "black"],
                                start: [0.5, 0],
                                end: [0.5, 1]
                            }
                        }}
                        opacity={0.8}/>

                    <Box w="100%" h="auto" pl="6" pb="6"
                        onLayout={e => setTextHeight(e.nativeEvent.layout.height)}
                        position="relative"
                        bottom={textHeight}
                    >
                        <Text color="white"
                            fontFamily="quicksand_b"
                            fontSize="xl">{payload.title}</Text>

                        <Text color="white"
                            fontFamily="quicksand_r"
                            fontSize="xs">{playlistStatsString(0, 0)}</Text>
                    </Box>
                </Box>
            </Box>

            <FlatList w="100%" h="100%" pt="2"
                data={ownTracks}
                renderItem={({item}) => <TrackElement trackId={item} w={screenW} key={item}/>}
                _contentContainerStyle={{ alignItems: "center", paddingBottom: 5 }}
                initialNumToRender={6}/>
        </Box>
    );
};

export const PlaylistHeader = ({ navigation, route }) => {
    const payload = route.params.payload;

    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclose();

    const handleBack = () => {
        navigation.dispatch(StackActions.pop());
    }

    const handleSettings = () => {
        onOpen();
    }

    return (
        <Box w="100%">
            {/* TODO Creeaza o componenta de actionsheet reutilizabila */}
            <Actionsheet isOpen={isOpen} onClose={onClose}>
                <Actionsheet.Content pb="4"
                    bg="primary.700"
                    _dragIndicatorWrapper={{ bg:"primary.700" }}
                    _dragIndicator={{ bg: "primary.50" }}
                >

                </Actionsheet.Content>
            </Actionsheet>
            <HStack h="16" alignItems="center">
                <FeatherNB h="auto" ml="4"
                    onPress={handleBack}
                    color="primary.50"
                    name="arrow-left"
                    fontSize={40}
                    shadow={5}/>

                <EntypoNB h="auto" ml="auto" mr="4"
                    onPress={handleSettings}
                    color="primary.50"
                    name="dots-three-vertical"
                    fontSize={30}
                    shadow={5}/>
            </HStack>
        </Box>
    )
};

export default PlaylistPage
