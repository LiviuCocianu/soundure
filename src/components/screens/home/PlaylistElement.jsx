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


/**
 * @callback navigateToPlaylist
 * @param {object} playlistObj Object containing information about the playlist
 */

/**
 * PlaylistElement component
 * 
 * @param {object} props props object 
 * @param {number} props.playlistID ID of the playlist corresponding to the
 *                                  entry in the database
 * @param {navigateToPlaylist} props.navigateToPlaylist Callback for navigating 
 *                             to the playlist page when a playlist element
 *                             is pressed
 * 
 * @returns {JSX.Element} JSX component
 */
const PlaylistElement = ({ playlistID, navigateToPlaylist }) => {
    const noTitle = "Titlu indisponibil";
    const noCoverURI = require("../../../../assets/icon/icon.png");
    const MarqueeNB = Factory(MarqueeText);

    const playlists = useSelector(state => state.playlists);
    const [title, setTitle] = useState(noTitle);
    const [coverURI, setCoverURI] = useState(noCoverURI);
    const [seconds, setSeconds] = useState(0);
    const [trackCount, setTrackCount] = useState(0);
    const [trackStats, setTrackStats] = useState("");

    const handleNavigation = () => {
        const found = playlists.find(pl => pl.id == playlistID);
        navigateToPlaylist(found);
    }

    useEffect(() => {
        const found = playlists.find(pl => pl.id == playlistID);

        if(found) {
            setTitle(!found.title || found.title == "" ? noTitle : found.title);
            setCoverURI(found.coverURI == null ? noCoverURI : {uri: found.coverURI});

            let seconds = 0;
            let trackCount = 0;

            // TODO handle fetching of total seconds and track count here

            const secondsTimestamp = seconds == 0 ? "" : `${seconds.toHHMMSS()} - `
            const tracks = trackCount > 1 || trackCount == 0 ? "piese" : "piesă";
            setTrackStats(`${secondsTimestamp}${trackCount} ${tracks}`);
        }
    }, [playlists]);
    
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
