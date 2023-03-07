import React from 'react';
import { Box, Image, AspectRatio, HStack, VStack, Text, Pressable } from 'native-base';

const PlaylistElement = ({
    data={}
}) => {
    let {
        coverURI,
        title = "Titlu playlist",
        seconds = 3600,
        trackCount = 50,
    } = data;

    coverURI = !coverURI || coverURI == null ? require("../assets/icon/icon.png") : coverURI;
    const tracks = trackCount > 1 ? "piese" : "piesă";

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
                    <VStack ml="2">
                        <Text color="white" fontFamily="quicksand_b" fontSize="md">{title}</Text>
                        <Text color="white" fontFamily="quicksand_l" fontSize="xs">
                            {`${seconds}`.toHHMMSS()} - {trackCount} {tracks}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        </Pressable>
    );
};

export default PlaylistElement;
