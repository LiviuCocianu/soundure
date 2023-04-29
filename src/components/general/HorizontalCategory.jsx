import React from 'react'
import { Box, HStack, Text, ScrollView, Pressable } from 'native-base'

import HorizontalCategoryElement from './HorizontalCategoryElement';

/**
 * HorizontalCategory component
 * 
 * @param {object} props props object
 * @param {object} props.navigation Object generated by React Navigation
 * @param {string} props.title Title to be displayed in the header
 * @param {object[]} props.tracks Tracks to display
 * @param {number} [props.maxContent] Maximum amount of tracks to show
 * 
 * @returns {JSX.Element} JSX component
 */
const HorizontalCategory = ({ 
    navigation, 
    title, 
    tracks, 
    maxContent=10 
}) => {
    const handleTrackPage = (trackId) => {
        navigation.navigate("Track", { trackId });
    }

    const handlePreviewPage = () => {
        const trackIDs = tracks.map(tr => tr.id);
        navigation.navigate("TracksPreview", { title, trackIDs })
    }

    const renderContent = tracks.slice(0, maxContent).map((el, index) => (
        <HorizontalCategoryElement
            onPress={() => handleTrackPage(el.id)}
            title={el.title}
            coverURI={el.coverURI}
            key={index}
        />
    ));

    return (
        <Box w="90%" h="200" mt="6"
            bg="primary.900"
            flex="1"
            flexGrow="0"
            alignItems="center"
            rounded="2xl"
        >
            <Pressable w="90%" mt="6" mx="6"
                alignItems="center"
                onPress={handlePreviewPage}
                _pressed={{ opacity: 80 }}
            >
                <HStack w="100%" px="2" pb="2"
                    justifyContent="space-between" 
                    alignItems="center"
                    borderBottomWidth="1" 
                    borderBottomColor="primary.50"
                    borderBottomRadius="md"
                >
                    <Text color="white" 
                        fontFamily="quicksand_b" 
                        fontSize="lg">{title}</Text>

                    <Text color="white" 
                        fontFamily="manrope_l" 
                        fontSize="xs">Previzualizare</Text>
                </HStack>
            </Pressable>

            {tracks.length == 0 ? (
                <Box w="90%" 
                    flexGrow="1"
                    justifyContent="center"
                    alignItems="center" 
                >
                    <Text color="gray.400" 
                        fontFamily="quicksand_b">Nu există conținut!</Text>

                    <Text color="gray.400" 
                        fontFamily="manrope_li" 
                        fontSize="xs">Adaugă ceva și revino mai târziu</Text>
                </Box>
            ) : (
                <ScrollView w="90%" h="50%" mt="6"
                    flexGrow="0"
                    _contentContainerStyle={{ overflow: "hidden" }}
                    snapToAlignment="center"
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    pagingEnabled
                >{renderContent}</ScrollView>
            )}
        </Box>
    );
};

export default HorizontalCategory
