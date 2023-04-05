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
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';

import { Feather, AntDesign, Entypo } from '@expo/vector-icons'
import PlatformIcon from '../../general/PlatformIcon';
import Toast from 'react-native-root-toast';

import { StackActions } from '@react-navigation/native';
import { handleCoverURI } from '../../../functions';
import { TrackUtils } from '../../../database/componentUtils';
import ConfirmationWindow from '../../modals/ConfirmationWindow';


const FeatherNB = Factory(Feather);
const AntDesignNB = Factory(AntDesign);
const EntypoNB = Factory(Entypo);

// TODO add documentation
const TrackPage = ({
    navigation,
    route: {
        params: {
            trackId
        }
    }
}) => {
    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);

    const [track, setTrack] = useState({});
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
    artist,
}) => {
    const dispatch = useDispatch();

    const [deletionWindow, toggleDeletionWindow] = useState(false);

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
        Toast.show(`Această piesă a fost preluată de pe ${track.platform.slice(0, 1)}${track.platform.slice(1).toLowerCase()}`, {
            duration: Toast.durations.LONG
        });
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
                <AspectRatio ratio="4/4" w="75%">
                    <Image
                        source={handleCoverURI(track.coverURI)}
                        alt="about track cover"
                        rounded="2xl"
                        shadow={10}
                        size="100%"
                    />
                </AspectRatio>

                <Box w="75%" h="auto">
                    <Text w="100%"
                        lineHeight="sm"
                        color="white"
                        fontFamily="quicksand_b"
                        fontSize="xl">{track.title}</Text>

                    <HStack w="100%" h="auto" mt="2"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Text
                            color="gray.400"
                            fontFamily="manrope_r"
                            fontSize="sm">{artist.name}</Text>

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
                            color: "primary.50"
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
