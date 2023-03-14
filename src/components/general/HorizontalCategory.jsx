import React from 'react'
import { Box, HStack, Text, ScrollView, Pressable } from 'native-base'


/**
 * @callback onPress
 */

/**
 * HorizontalCategory component
 * 
 * @param {object} props props object
 * @param {string} props.title Title to be displayed in the header
 * @param {JSX.Element[]} props.render Components to render inside the category
 * @param {onPress} props.onPress Callback to trigger when the preview header is pressed
 * 
 * @returns {JSX.Element} JSX component
 */
const HorizontalCategory = ({ title, render, onPress }) => {
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
                onPress={onPress}
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

            {render.length == 0 ? (
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
                    pagingEnabled>{render}</ScrollView>
            )}
        </Box>
    );
};

export default HorizontalCategory
