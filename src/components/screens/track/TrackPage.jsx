import React, { useState, useEffect, memo } from 'react';
import { 
    Box,
    HStack,
    Factory,
    Image,
    VStack,
    AspectRatio,
    Text,
    ScrollView,
    Button,
    Input,
    FormControl,
    Pressable,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';

import * as ImagePicker from 'expo-image-picker'
import { Feather, AntDesign, Entypo } from '@expo/vector-icons'
import PlatformIcon from '../../general/PlatformIcon';
import Toast from 'react-native-root-toast';

import { StackActions } from '@react-navigation/native';
import { handleCoverURI } from '../../../functions';
import { TrackUtils } from '../../../database/componentUtils';
import ConfirmationWindow from '../../modals/ConfirmationWindow';
import { IMAGE_QUALITY } from '../../../constants';


const FeatherNB = Factory(Feather);
const AntDesignNB = Factory(AntDesign);
const EntypoNB = Factory(Entypo);

/**
 * TrackPage component
 * 
 * @param {object} props props object
 * @param {object} props.navigation React Navigation object
 * @param {object} props.route
 * @param {object} props.route.params
 * @param {number} props.route.params.trackId ID corresponding to the track 
 * 
 * @returns {JSX.Element} JSX component
 */
const TrackPage = ({
    navigation,
    route: { params: { trackId } }
}) => {
    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);

    const [track, setTrack] = useState({title: "", millis: 0});
    const [artist, setArtist] = useState({});

    useEffect(() => {
        const foundTrack = tracks.find(el => el.id == trackId);

        if(foundTrack) {
            setTrack(foundTrack);

            const foundArtist = artists.find(el => el.id == foundTrack.artistId);
            if(foundArtist) {
                setArtist(foundArtist);
            }
        }
    }, [tracks]);

    return (
        <Box w="100%" h="100%"
            bg={{
                linearGradient: {
                    colors: ["black", "primary.900"],
                    start: [0.5, 0],
                    end: [0.5, 1]
                }
            }}
            alignItems="center"
        >
            <ScrollView w="100%" h="100%"
                _contentContainerStyle={{ flexGrow: 1 }}
            >
                <TrackInfo 
                    navigation={navigation}
                    track={track}
                    artist={artist}/>
            </ScrollView>
        </Box>
    );
};

const TrackInfo = memo(({
    navigation,
    track,
    artist
}) => {
    const dispatch = useDispatch();

    const [title, setTitle] = useState("");
    const [titleEditor, toggleTitleEditor] = useState(false);

    const [coverURI, setCoverURI] = useState(undefined);
    const [coverEditor, toggleCoverEditor] = useState(false);
    const [confirmedCoverEdit, toggleConfirmCoverEdit] = useState(false);

    const [deletionWindow, toggleDeletionWindow] = useState(false);

    useEffect(() => {
        if(confirmedCoverEdit) {
            setTimeout(() => {
                toggleConfirmCoverEdit(false);
            }, 2000);
        }
    }, [confirmedCoverEdit]);

    const handleBack = () => {
        navigation.dispatch(StackActions.pop());
    }

    const handleTrackDelete = () => {
        TrackUtils.deleteTrack(track.id, dispatch);
        handleBack();
    }

    const handleToggleFavorite = () => {
        TrackUtils.toggleFavorite(track.id, dispatch);
    }

    const handlePlatformIcon = () => {
        const p = `${track.platform.slice(0, 1)}${track.platform.slice(1).toLowerCase()}`;
        Toast.show(`Această piesă a fost preluată de pe ${p}`, {
            duration: Toast.durations.LONG
        });
    }

    const handleTitleEdit = () => {
        if(!titleEditor) {
            setTitle(track.title);
            toggleTitleEditor(true);

            Toast.show("Sfat: Tine creionul apăsat pentru a anula editarea", {
                duration: Toast.durations.LONG
            });
        } else {
            toggleTitleEditor(false);
            TrackUtils.setTitle(title, track.id, dispatch);
        }
    }

    const handlePreCoverEdit = () => {
        if(!confirmedCoverEdit) {
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
            TrackUtils.setCoverURI(result.assets[0].uri, track.id, dispatch);
        }
    }

    return (
        <>
            <ConfirmationWindow
                isOpen={deletionWindow}
                toggleVisible={toggleDeletionWindow}
                title="Ștergere permanentă"
                description={`Această piesă va fi eliminată din aplicație dacă confirmi! Sigur vrei să faci asta? 
                
Fișierul asociat piesei nu va fi șters din dispozitiv!`}
                onYes={handleTrackDelete}
            />

            <VStack w="100%" h="100%" mt="25%"
                alignItems="center"
                space="5"
            >
                <Pressable onPress={handlePreCoverEdit}>
                    <AspectRatio ratio="4/4" w="75%">
                        <Image
                            source={handleCoverURI(track.coverURI)}
                            alt="about track cover"
                            rounded="2xl"
                            shadow={10}
                            size="100%"
                        />
                    </AspectRatio>
                </Pressable>

                <Box w="75%" h="auto">
                    <Box>
                        {
                            !titleEditor ? (
                                <Text w="100%"
                                    lineHeight="sm"
                                    color="white"
                                    fontFamily="quicksand_b"
                                    fontSize="xl"
                                >
                                    {track.title}{" "}
                                    <EntypoNB
                                        onPress={handleTitleEdit}
                                        name="edit"
                                        color="primary.50" />
                                </Text>
                            ) : (
                                <FormControl flex="1" flexDirection="row">
                                    <Input h="45" mr="2"
                                        onChangeText={setTitle}
                                        borderColor="primary.500"
                                        flexGrow="1"
                                        color="white"
                                        fontFamily="quicksand_b"
                                        fontSize="xl"
                                        value={title}/>

                                    <Button w="45" h="45" p="0" mr="2"
                                        onPress={handleTitleEdit}
                                        onLongPress={() => toggleTitleEditor(false)}
                                        bg="transparent"
                                        borderWidth="1"
                                        borderColor="primary.500"
                                        rounded="lg"
                                        _pressed={{ bg: "transparent" }}
                                    >
                                        <EntypoNB
                                            name="edit"
                                            color="primary.50"
                                            fontSize={25} />
                                    </Button>
                                </FormControl>
                            )
                        }
                        
                    </Box>

                    <HStack w="100%" h="auto" mt="2"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Text
                            color="gray.400"
                            fontFamily="manrope_r"
                            fontSize="sm">{artist.name} • {track.millis.toString().toHHMMSS()}</Text>

                        <PlatformIcon
                            onPress={handlePlatformIcon}
                            platform={track.platform}
                            size={21} />
                    </HStack>
                </Box>

                <HStack w="75%" h="auto"
                    flex="1"
                    flexGrow="0"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Button flexGrow="1" h="45" mr="2"
                        bg="primary.500"
                        rounded="lg"
                        _pressed={{
                            bg: "primary.600"
                        }}
                        _text={{
                            fontFamily: "manrope_b",
                            color: "pink.100"
                        }}
                    >Ascultă</Button>

                    <Button w="45" h="45" p="0" mr="2"
                        onPress={() => toggleDeletionWindow(true)}
                        bg="transparent"
                        borderWidth="3"
                        borderColor="primary.500"
                        rounded="lg"
                        _pressed={{
                            bg: "transparent"
                        }}
                    >
                        <EntypoNB
                            name="trash"
                            color="primary.50"
                            fontSize={25} />
                    </Button>

                    <Button w="45" h="45" p="0"
                        onPress={handleToggleFavorite}
                        bg="transparent"
                        borderWidth="3"
                        borderColor="primary.500"
                        rounded="lg"
                        _pressed={{
                            bg: "transparent"
                        }}
                    >
                        <AntDesignNB
                            name={track.favorite ? "star" : "staro"}
                            color="primary.50"
                            fontSize={25} />
                    </Button>
                </HStack>
            </VStack>
        </>
        
    )
}, (prev, next) => prev.navigation == next.navigation
    && prev.track.coverURI == next.track.coverURI
    && prev.track.title == next.track.title
    && prev.track.millis == next.track.millis
    && prev.track.platform == next.track.platform
    && prev.track.favorite == next.track.favorite
    && prev.artist.name == next.artist.name
);


export const TrackHeader = ({ navigation, route }) => {
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

export default TrackPage;
