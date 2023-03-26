import React, { useEffect, useState, memo } from 'react';
import { ImageBackground } from 'react-native';
import { HStack, Factory, AspectRatio, VStack, Text, Pressable, Checkbox } from 'native-base'

import { Entypo } from '@expo/vector-icons';
import MarqueeText from 'react-native-marquee'

import { handleCoverURI } from '../../../functions';
import { TRACK_EL_HEIGHT } from '../../../constants';
import { useSelector } from 'react-redux';


const ImageNB = Factory(ImageBackground);
const IconNB = Factory(Entypo);
const MarqueeNB = Factory(MarqueeText);

/**
 * TrackElement component
 * 
 * @returns {JSX.Element} JSX component
 */
const TrackElement = ({
    w="100%",
    trackId,
    selectionMode,
    allSelected=false,
    selectionHandler=() => {}
}) => {
    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);

    const [track, setTrack] = useState({});
    const [artist, setArtist] = useState({});

    const [isSelected, setSelected] = useState(false);

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

    useEffect(() => {
        setSelected(allSelected);
        selectionHandler(allSelected, null);
    }, [allSelected]);

    const handleSelection = (isSelected) => {
        setSelected(isSelected);
        selectionHandler(isSelected, trackId);
    }

    const handlePress = () => {
        if(selectionMode) {
            handleSelection(!isSelected);
        }
    }

    return (
        <Pressable _pressed={{ opacity: 0.8 }} 
            onPress={handlePress}
        >
            <HStack w={w} h={TRACK_EL_HEIGHT} mb="1"
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

                <TrackInfo w={w} title={track.title} artist={artist.name}/>

                {
                    !selectionMode ? (
                        <IconNB mr="2" py="4"
                            color="primary.50"
                            name="dots-three-vertical" 
                            fontSize={20}
                            alignSelf="center"/>
                    ) : (
                        <Checkbox my="auto" p="1" mr="4"
                            aria-label="track selection checkbox"
                            bg="gray.500"
                            borderWidth="0"
                            isChecked={isSelected}
                            onChange={handleSelection}/>
                    )
                }
            </HStack>
        </Pressable>
    );
};


const TrackInfo = memo(({w, title, artistName}) => (
    <VStack w="auto" pl="6" mr="auto"
        justifyContent="center"
        borderTopRightRadius="lg"
        borderBottomRightRadius="lg"
    >
        <MarqueeNB w={w * 0.55}
            color="white"
            fontFamily="quicksand_b"
            fontSize="md"
            speed={0.3}>{title ? title : "Titlu piesă"}</MarqueeNB>

        <Text color="gray.300"
            fontFamily="manrope_r"
            fontSize="xs">▶ {artistName ? artistName : "Nume artist"}</Text>
    </VStack>
), (prev, next) => {
    if(prev.title == next.title && prev.artistName == next.artistName) return true;
    return false;
});

export default TrackElement
