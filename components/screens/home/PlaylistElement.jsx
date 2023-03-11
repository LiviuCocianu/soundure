import React, { useEffect, useState } from 'react';
import { 
    Box,
    Image,
    AspectRatio,
    HStack,
    VStack,
    Text,
    Pressable,
    Factory
} from 'native-base';
import MarqueeText from 'react-native-marquee'
import { useSelector } from 'react-redux';

const PlaylistElement = ({
    playlistID
}) => {
    const noTitle = "Titlu indisponibil";
    const noCoverURI = require("../../../assets/icon/icon.png");

    const playlists = useSelector(state => state.playlists);
    const [title, setTitle] = useState(noTitle);
    const [coverURI, setCoverURI] = useState(noCoverURI);
    const [seconds, setSeconds] = useState(0);
    const [trackCount, setTrackCount] = useState(0);
    const [trackStats, setTrackStats] = useState("");

    // let {
    //     coverURI,
    //     title = "Titlu indisponibil",
    //     seconds = 0,
    //     trackCount = 0,
    // } = data;

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
        <Pressable _pressed={{ opacity: 80 }}>
            <Box bg={{
                    linearGradient: {
                        colors: ["primary.700", "primary.800"],
                        start: [0, 0],
                        end: [0, 1]
                    }
                }}
                w="100%" h="20" 
                rounded="xl" 
                justifyContent="center" 
                mb="1"
                shadow="2"
            >
                <HStack alignItems="center" h="100%" w="100%">
                    <AspectRatio ratio="4/4" h="90%" ml="2">
                        <Image 
                            source={coverURI} 
                            alt="playlist cover"
                            h="100%"
                            w="100%"
                            rounded="lg"
                        />
                    </AspectRatio>
                    <VStack ml="4">
                        <Text color="white" fontFamily="quicksand_b" fontSize="md">{title}</Text>
                        <Text color="white" fontFamily="quicksand_l" fontSize="xs">{trackStats}</Text>
                    </VStack>
                </HStack>
            </Box>
        </Pressable>
    );
};

export default PlaylistElement;
