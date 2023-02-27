import React from 'react';
import { Box, AspectRatio } from 'native-base';

const HistoryCategoryElement = ({
    color
}) => {
    return (
        <Box mr="2">
            <AspectRatio ratio="2/2" flexGrow="1">
                <Box 
                    w="100%" h="100%" mr="2"
                    bg={color}
                    rounded="xl"
                >

                </Box>
            </AspectRatio>
        </Box>
    );
};

export default HistoryCategoryElement;
