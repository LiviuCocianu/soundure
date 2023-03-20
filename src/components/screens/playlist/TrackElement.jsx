import React, { useEffect, useState } from 'react';
import { ImageBackground } from 'react-native';
import { Box, HStack, Factory, AspectRatio, VStack, Text, Pressable } from 'native-base'

import { Entypo } from '@expo/vector-icons';
import MarqueeText from 'react-native-marquee'

import { handleCoverURI } from '../../../functions';
import { useSelector } from 'react-redux';


const ImageNB = Factory(ImageBackground);
const IconNB = Factory(Entypo);
const MarqueeNB = Factory(MarqueeText);

/**
 * TrackElement component
 * 
 * @returns {JSX.Element} JSX component
 */
const TrackElement = ({ w="100%", trackId }) => {
    const trackWidth = w * 0.95;
    const trackHeight = 85;

    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);

    const [track, setTrack] = useState({});
    const [artist, setArtist] = useState({});

    useEffect(() => {
        const foundTrack = tracks.find(el => el.id == trackId);
        if(foundTrack) {
            setTrack(foundTrack);

            const foundArtist = artists.find(el => el.id == foundTrack.artistId);
            if(foundArtist) setArtist(foundArtist);
        }
    }, [tracks]);

    return (
        <Pressable _pressed={{ opacity: 0.8 }}>
            <HStack w={trackWidth} h={trackHeight} mb="1"
                bg={{
                    linearGradient: {
                        colors: ["primary.700", "gray.900"],
                        start: [0, 0.5],
                        end: [1, 0.5]
                    }
                }}
                rounded="lg" 
                shadow="2"
            >
                <AspectRatio ratio="4/4" h="auto">
                    <ImageNB
                        source={handleCoverURI(track.coverURI)}
                        imageStyle={{ 
                            borderTopLeftRadius: 10,
                            borderBottomLeftRadius: 10
                        }}/>
                </AspectRatio>

                <VStack w="auto" pl="6" mr="auto"
                    justifyContent="center"
                    borderTopRightRadius="lg"
                    borderBottomRightRadius="lg"
                >
                    <MarqueeNB w="65%"
                        color="white"
                        fontFamily="quicksand_b"
                        fontSize="md"
                        speed={0.3}>{track.title ? track.title : "Titlu piesă"}</MarqueeNB>

                    <Text color="gray.300"
                        fontFamily="manrope_r"
                        fontSize="xs">▶ {artist.name ? artist.name : "Nume artist"}</Text>
                </VStack>

                <IconNB mr="2" py="4"
                    color="primary.50"
                    name="dots-three-vertical" 
                    fontSize={20}
                    alignSelf="center"/>
            </HStack>
        </Pressable>
    );
};


export default TrackElement;
