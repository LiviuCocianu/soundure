import React, { useState, useEffect, memo, useMemo } from 'react'
import { ImageBackground, StyleSheet } from 'react-native';
import { Box, Factory, HStack, Text, useDisclose, FormControl, Input, Button, Pressable } from 'native-base'

import { StackActions } from "@react-navigation/native"
import { Feather, Entypo } from '@expo/vector-icons'; 
import { useDispatch, useSelector } from 'react-redux';

import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-root-toast';

import PlaylistSettingsSheet from './PlaylistSettingsSheet';
import OrderPanel from './OrderPanel';

import { PlaylistBridge } from '../../../database/componentBridge';
import { handleCoverURI, lng, composePlaylistInfo } from '../../../functions';
import { IMAGE_QUALITY, SCREEN_WITH_PLAYER_HEIGHT } from '../../../constants';
import OptimizedTrackList from '../../general/OptimizedTrackList';


const handleTrackListNav = (navigation, payload) => {
    navigation.navigate("TrackList", { payload });
};

const MAX_TITLE_LENGTH = 48;

const ImageNB = Factory(ImageBackground);
const FeatherNB = Factory(Feather);
const EntypoNB = Factory(Entypo);

// TODO make playlist title and cover editable, like TrackPage!!
// TODO add description field somewhere

/**
 * PlaylistPage component
 * 
 * @param {object} props props object
 * @param {object} props.navigation Object generated by React Navigation
 * @param {object} props.route Object generated by React Navigation
 * @param {object} props.route.params
 * @param {number} props.route.params.playlistId ID corresponding to the playlist 
 * 
 * @returns {JSX.Element} JSX component
 */
const PlaylistPage = ({ navigation, route: { params: { playlistId } } }) => {
    const playlistsContent = useSelector(state => state.playlistsContent);
    const playlists = useSelector(state => state.playlists);

    const [coverHeight, setCoverHeight] = useState(0);
    
    const playlist = useMemo(() => {
        return playlists.find(pl => pl.id == playlistId);
    }, [playlists]);
    
    const ownTracks = useMemo(() => {
        return playlistsContent
            .filter(link => link.playlistId == playlist.id)
            .map(link => link.trackId);
    }, [playlistsContent]); // !! List of IDs !!

    const handleInfoPress = () => {
        if (playlist) handleTrackListNav(navigation, playlist);
    }

    const handleCoverHeight = (e) => {
        setCoverHeight(e.nativeEvent.layout.height);
    }

    return (
        <Box w="100%" h={`${SCREEN_WITH_PLAYER_HEIGHT}px`}
            bg={lng(["gray.700", "black"], "bottom")}
        >
            <OrderPanel 
                playlistId={playlistId}
                coverHeight={coverHeight}/>

            <PlaylistCover
                playlist={playlist}
                ownTracks={ownTracks}
                handleCoverHeight={handleCoverHeight}/>

            <OptimizedTrackList 
                navigation={navigation}
                playlist={playlist}
                ownTracks={ownTracks}
                onInfoPress={handleInfoPress}/>
        </Box>
    );
};

const PlaylistCover = memo(({
    playlist,
    ownTracks,
    handleCoverHeight
}) => {
    const dispatch = useDispatch();
    const tracks = useSelector(state => state.tracks);

    const [textHeight, setTextHeight] = useState(0);
    const [title, setTitle] = useState("");
    const [titleEditor, toggleTitleEditor] = useState(false);

    const [confirmedCoverEdit, toggleConfirmCoverEdit] = useState(false);

    const totalMillis = useMemo(() => {
        return ownTracks
            .filter(id => tracks.find(tr => tr.id == id))
            .map(id => tracks.find(tr => tr.id == id).millis)
            .reduce((prev, curr) => prev + curr, 0);
    }, [ownTracks, tracks]);

    const playlistTitle = useMemo(() => {
        return playlist.title.length > MAX_TITLE_LENGTH
            ? playlist.title.slice(0, MAX_TITLE_LENGTH - 3) + "..."
            : playlist.title;
    }, [playlist]);

    useEffect(() => {
        if (confirmedCoverEdit) {
            setTimeout(() => {
                toggleConfirmCoverEdit(false);
            }, 2000);
        }
    }, [confirmedCoverEdit]);

    const handleTitleEdit = () => {
        if (!titleEditor) {
            setTitle(playlist.title);
            toggleTitleEditor(true);

            Toast.show("Sfat: Tine creionul apăsat pentru a anula editarea", {
                duration: Toast.durations.LONG
            });
        } else {
            toggleTitleEditor(false);
            PlaylistBridge.setTitle(title, playlist.id, dispatch);
        }
    }

    const handleTitleToast = () => {
        if (playlist.title.length > MAX_TITLE_LENGTH) {
            Toast.show(playlist.title, { duration: Toast.durations.LONG });
        }
    }

    const handlePreCoverEdit = () => {
        if (!confirmedCoverEdit) {
            Toast.show("Apasă încă o dată rapid pentru a edita coperta!");
            toggleConfirmCoverEdit(true);
        } else {
            handleCoverChoice();
        }
    }

    const handleCoverChoice = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: IMAGE_QUALITY,
        });

        if (!result.canceled) {
            PlaylistBridge.setCoverURI(result.assets[0].uri, playlist.id, dispatch);
        }
    }

    return (
        <Box w="100%" h="35%" onLayout={handleCoverHeight}>
            <ImageNB w="100%" h="100%"
                source={handleCoverURI(playlist.coverURI)}
                imageStyle={{ height: "100%" }} />

            <Box w="100%" h="100%" style={{ ...StyleSheet.absoluteFillObject }}>
                {/* Gradient shadow over cover */}
                <Pressable onPress={handlePreCoverEdit}>
                    <Box w="100%" h="100%"
                        bg={lng(["black", "t", "t", "t", "gray.800", "black"], "bottom")}
                        opacity={0.8} />
                </Pressable>

                {/* Header inside cover */}
                <Box w="92%" h="auto" pl="6" pb="6"
                    onLayout={e => setTextHeight(e.nativeEvent.layout.height)}
                    position="relative"
                    bottom={textHeight}
                >
                    {
                        !titleEditor ? (
                            <Text color="white"
                                onPress={handleTitleToast}
                                fontFamily="quicksand_b"
                                fontSize="xl"
                                lineHeight="xs"
                                style={{
                                    textShadowRadius: 5,
                                    textShadowColor: 'black',
                                    textShadowOffset: { width: 1, height: 3 }
                                }}
                            >
                                {playlistTitle}{" "}
                                <EntypoNB
                                    onPress={handleTitleEdit}
                                    name="edit"
                                    color="primary.50" />
                            </Text>
                        ) : (
                            <FormControl flexDir="row">
                                <Input w="80%" h="8" p="1"
                                    value={title}
                                    onChangeText={setTitle}
                                    color="white"
                                    fontFamily="quicksand_b"
                                    fontSize="xl"
                                    selectionColor="white"
                                    _focus={{ borderColor: "white" }}/>
                                
                                <Button w="8" h="8" ml="2" p="0"
                                    borderColor="white"
                                    borderWidth="1"
                                    bg="white"
                                    _pressed={{ bg: "gray.400" }}
                                >
                                    <EntypoNB
                                        onPress={handleTitleEdit}
                                        onLongPress={() => toggleTitleEditor(false)}
                                        name="edit"
                                        color="black"
                                        fontSize={20}/>
                                </Button>
                            </FormControl>
                        )
                    }

                    <Text color="white"
                        fontFamily="quicksand_r"
                        fontSize="xs">{composePlaylistInfo(ownTracks.length, totalMillis / 1000)}</Text>
                </Box>
            </Box>
        </Box>
    );
}, (prev, next) => prev.playlist.title == next.playlist.title
    && prev.playlist.coverURI == next.playlist.coverURI
    && prev.ownTracks == next.ownTracks
);


export const PlaylistHeader = ({ navigation, route: { params: { playlistId } } }) => {
    const disclose = useDisclose();

    const handleBack = () => {
        navigation.dispatch(StackActions.pop());
    }

    return (
        <Box w="100%">
            <PlaylistSettingsSheet
                navigation={navigation}
                playlistId={playlistId}
                discloseObject={disclose}/>

            <HStack h="16" alignItems="center">
                <FeatherNB h="auto" ml="4" p="1"
                    bg="black"
                    borderRadius="full"
                    onPress={handleBack}
                    color="primary.50"
                    name="arrow-left"
                    fontSize={30}
                    shadow={5}/>

                <EntypoNB h="auto" ml="auto" mr="4"
                    onPress={disclose.onOpen}
                    color="primary.50"
                    name="dots-three-vertical"
                    fontSize={25}
                    shadow={5}/>
            </HStack>
        </Box>
    )
};


export default PlaylistPage
