import React from 'react';
import { Box, HStack, Text, ScrollView, Pressable } from 'native-base';

const HorizontalCategory = ({
    title,
    render,
    onPress,
}) => {
    return (
        <Box w="90%" h="200" 
            mt="6"
            bg="primary.900"
            rounded="2xl"
            alignItems="center"
            flex="1"
            flexGrow="0"
        >
            <Pressable w="90%" 
                mt="6" mx="6"
                alignItems="center"
                _pressed={{ opacity: 80 }}
                onPress={onPress}
            >
                <HStack w="100%"
                    px="2" pb="2"
                    justifyContent="space-between" 
                    alignItems="center"
                    borderBottomWidth="1" 
                    borderBottomColor="primary.50"
                    borderBottomRadius="md"
                >
                    <Text color="white" fontFamily="quicksand_b" fontSize="lg">{title}</Text>
                    <Text color="white" fontFamily="manrope_l" fontSize="xs">Previzualizare</Text>
                </HStack>
            </Pressable>

            {render.length == 0 ? (
                <Box w="90%" flexGrow="1"
                    alignItems="center" 
                    justifyContent="center"
                >
                    <Text color="gray.400" fontFamily="quicksand_b">Nu există conținut!</Text>
                    <Text color="gray.400" fontFamily="manrope_li" fontSize="xs">Adaugă ceva și revino mai târziu</Text>
                </Box>
            ) : (
                <ScrollView 
                    w="90%" h="50%"
                    mt="6"
                    flexGrow="0"
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="center"
                    _contentContainerStyle={{
                        overflow: "hidden",
                    }}
                >
                    {render}
                </ScrollView>
            )}
        </Box>
    );
};

export default HorizontalCategory;
