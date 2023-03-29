import React, { useEffect, useState } from 'react'
import { 
    Box,
    Image,
    AspectRatio,
    HStack,
    VStack,
    Text,
    Pressable,
    Factory
} from 'native-base'

import MarqueeText from 'react-native-marquee'
import { useSelector } from 'react-redux'

import { Audio } from 'expo-av'
import { playlistStatsString } from '../../../functions'


/**
 * @callback navigateToPlaylist
 * @param {object} playlistObj Object containing information about the playlist
 */

/**
 * PlaylistElement component
 * 
 * @param {object} props props object 
 * @param {number} props.playlistId ID of the playlist corresponding to the
 *                                  entry in the database
 * @param {navigateToPlaylist} props.navigateToPlaylist Callback for navigating 
 *                             to the playlist page when a playlist element
 *                             is pressed
 * 
 * @returns {JSX.Element} JSX component
 */
const PlaylistElement = ({ playlistId, navigateToPlaylist }) => {
    const noTitle = "Titlu indisponibil";
    const noCoverURI = require("../../../../assets/icon/icon.png");
    const MarqueeNB = Factory(MarqueeText);

    const tracks = useSelector(state => state.tracks);
    const playlists = useSelector(state => state.playlists);
    const playlistsContent = useSelector(state => state.playlistsContent);

    const [title, setTitle] = useState(noTitle);
    const [coverURI, setCoverURI] = useState(noCoverURI);

    const [ownTracks, setOwnTracks] = useState([]);
    const [totalDuration, setTotalDuration] = useState(0);
    const [trackStats, setTrackStats] = useState("");
    
    useEffect(() => {
        const found = playlists.find(pl => pl.id == playlistId);
        
        if(found) {
            setTitle(!found.title || found.title == "" ? noTitle : found.title);
            setCoverURI(found.coverURI == null ? noCoverURI : {uri: found.coverURI});
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

    useEffect(() => {
        setTrackStats(playlistStatsString(ownTracks.length, totalDuration));
    }, [totalDuration])

    const handleNavigation = () => {
        const found = playlists.find(pl => pl.id == playlistId);
        navigateToPlaylist(found);
    }

    const handleTotalDuration = async () => {
        let sum = 0;

        for(const trackID of ownTracks) {
            const track = tracks.find(tr => tr.id == trackID);
            const uri = track.fileURI;
            const dur = await getDuration(uri);
            sum += dur;
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
        <Pressable onPress={handleNavigation} _pressed={{ opacity: 80 }}>
            <Box w="100%" h="20" mb="1"
                justifyContent="center"
                bg={{
                    linearGradient: {
                        colors: ["primary.700", "primary.800"],
                        start: [0, 0],
                        end: [0, 1]
                    }
                }}
                rounded="xl" 
                shadow="2"
            >
                <HStack w="100%" h="100%" alignItems="center">
                    <AspectRatio h="90%" ml="2" ratio="4/4">
                        <Image w="100%" h="100%"
                            source={coverURI} 
                            alt="playlist cover"
                            rounded="lg"/>
                    </AspectRatio>

                    <VStack h="100%" w="70%" pl="4" 
                        justifyContent="center" 
                        overflow="hidden"
                    >
                        <MarqueeNB 
                            color="white" 
                            fontFamily="quicksand_b" 
                            fontSize="md" 
                            speed={0.3}>{title}</MarqueeNB>

                        <Text 
                            color="white"
                            fontFamily="quicksand_l" 
                            fontSize="xs">{trackStats}</Text>
                    </VStack>
                </HStack>
            </Box>
        </Pressable>
    );
};

export default PlaylistElement
