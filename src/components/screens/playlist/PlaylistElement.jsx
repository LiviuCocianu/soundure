import React, { useEffect, useState } from 'react'
import { StyleSheet, ImageBackground } from 'react-native'
import { 
    Box,
    Image,
    AspectRatio,
    HStack,
    VStack,
    Text,
    Pressable,
    Factory,
    useDisclose
} from 'native-base'

import MarqueeText from 'react-native-marquee'
import { useSelector } from 'react-redux'

import { Audio } from 'expo-av'
import { handleCoverURI, lng, composePlaylistInfo } from '../../../functions'
import PlaylistSettingsSheet from './PlaylistSettingsSheet'


const noTitle = "Titlu indisponibil";
const MarqueeNB = Factory(MarqueeText);
const ImageBackgroundNB = Factory(ImageBackground);

/**
 * @callback navigateToPlaylist
 * @param {object} playlistObj Object containing information about the playlist
 */

/**
 * PlaylistElement component
 * 
 * @param {object} props props object 
 * @param {object} props.navigation Object generated by React Navigation
 * @param {number} props.playlistId ID of the playlist corresponding to the
 *                                  entry in the database
 * @param {navigateToPlaylist} props.navigateToPlaylist Callback for navigating 
 *                             to the playlist page when a playlist element
 *                             is pressed
 * 
 * @returns {JSX.Element} JSX component
 */
const PlaylistElement = ({
    navigation,
    playlistId,
    navigateToPlaylist
}) => {
    const tracks = useSelector(state => state.tracks);
    const playlists = useSelector(state => state.playlists);
    const playlistsContent = useSelector(state => state.playlistsContent);

    const [title, setTitle] = useState(noTitle);
    const [coverURI, setCoverURI] = useState(handleCoverURI(null));

    const [ownTracks, setOwnTracks] = useState([]);
    const [totalDuration, setTotalDuration] = useState(0);

    const disclose = useDisclose();
    
    useEffect(() => {
        const found = playlists.find(pl => pl.id == playlistId);
        
        if(found) {
            setTitle(!found.title || found.title == "" ? noTitle : found.title);
            setCoverURI(handleCoverURI(found.coverURI));
        }
    }, [playlists]);

    useEffect(() => {
        setOwnTracks(playlistsContent
            .filter(link => link.playlistId == playlistId)
            .map(link => link.trackId));
    }, [playlistsContent]);

    useEffect(() => {
        const toID = setTimeout(() => handleTotalDuration(), 500);
        return () => clearTimeout(toID);
    }, [ownTracks]);

    const handleNavigation = () => {
        navigateToPlaylist(playlistId);
    }

    const handleSettings = () => {
        disclose.onOpen();
    }

    const handleTotalDuration = async () => {
        let sum = 0;

        for(const trackID of ownTracks) {
            const track = tracks.find(tr => tr.id == trackID);

            if(track.fileURI) {
                const uri = track.fileURI;
                const dur = await getDuration(uri);
                sum += dur;
            }
        }

        setTotalDuration(sum);
    }

    const getDuration = async (uri) => {
        const sound = new Audio.Sound();

        try {
            await sound.loadAsync({ uri });
            const data = await sound.getStatusAsync();

            return data.durationMillis / 1000;
        } catch (error) {
            console.error(`Could not load track for '${uri}':`, error);
        }

        return 0;
    }

    return (
        <Pressable onPress={handleNavigation}
            onLongPress={handleSettings}
            _pressed={{ opacity: 80 }}
        >
            <PlaylistSettingsSheet
                navigation={navigation}
                playlistId={playlistId}
                discloseObject={disclose}
            />

            <ImageBackgroundNB w="100%" h="20" mb="1"
                source={coverURI}
                justifyContent="center"
                shadow="2"
                blurRadius={10}
                imageStyle={{ borderRadius: 10 }}
            >
                <Box w="100%" h="100%" bg={lng(["primary.700", "primary.800"], "bottom")}
                    opacity="0.8" 
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        borderRadius: 10
                    }}/>

                <HStack w="100%" h="100%" alignItems="center">
                    <AspectRatio h="90%" ml="2" ratio="4/4">
                        <Image w="100%" h="100%"
                            source={coverURI}
                            alt="playlist cover"
                            rounded="lg" />
                    </AspectRatio>

                    <VStack h="100%" w="70%" pl="4"
                        justifyContent="center"
                        overflow="hidden"
                    >
                        <MarqueeNB
                            color="white"
                            fontFamily="quicksand_b"
                            fontSize="md"
                            style={{
                                textShadowRadius: 5,
                                textShadowColor: 'black',
                                textShadowOffset: { width: 1, height: 2 }
                            }}
                            speed={0.3}>{title}</MarqueeNB>

                        <Text
                            color="white"
                            fontFamily="quicksand_l"
                            style={{
                                textShadowRadius: 5,
                                textShadowColor: 'black',
                                textShadowOffset: { width: 1, height: 2 }
                            }}
                            fontSize="xs">{composePlaylistInfo(ownTracks.length, totalDuration)}</Text>
                    </VStack>
                </HStack>
            </ImageBackgroundNB>
        </Pressable>
    );
};

export default PlaylistElement
