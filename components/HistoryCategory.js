import React from 'react';
import { Box, HStack, VStack, Text, ScrollView, AspectRatio } from 'native-base';
import HistoryCategoryElement from './HistoryCategoryElement';

const HistoryCategory = () => {
    return (
        <Box 
            bg="primary.900"
            w="90%" h="200" 
            mt="6"
            rounded="2xl"
            alignItems="center"
            flex="1"
            flexGrow="0"
        >
            <HStack 
                w="90%" m="6" pb="2" px="2"
                justifyContent="space-between" 
                alignItems="center"
                borderBottomWidth="1" 
                borderBottomColor="primary.50"
                borderBottomRadius="md"
            >
                <Text color="white" fontFamily="quicksand_b" fontSize="lg">Istoric redări</Text>
                <Text color="white" fontFamily="manrope_l" fontSize="xs">Previzualizare</Text>
            </HStack>

            <ScrollView 
                w="90%" h="50%"
                flexGrow="0"
                horizontal
                pagingEnabled
                decelerationRate={0}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="center"
                _contentContainerStyle={{
                    overflow: "hidden",
                }}
            >
                {
                    ["50", "100", "200", "300",
                    "400", "500", "600", "700"]
                    .map(w => <HistoryCategoryElement color={`red.${w}`} key={w}/>)
                }
            </ScrollView>
        </Box>
    );
};

export default HistoryCategory;
