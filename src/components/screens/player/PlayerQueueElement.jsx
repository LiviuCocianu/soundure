import React, { useMemo } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { Box } from 'native-base'

import { useSelector } from 'react-redux'
import { ScaleDecorator } from 'react-native-draggable-flatlist'

import { QUEUE_TRACK_EL_HEIGHT } from '../../../constants'


const PlayerQueueElement = ({
    trackId,
    drag,
    isActive
}) => {
    const tracks = useSelector(state => state.tracks);
    const track = useMemo(() => tracks.find(tr => tr.id == trackId), [tracks]);

    return (
        <ScaleDecorator>
            <TouchableWithoutFeedback
                onLongPress={drag}
                disabled={isActive}
            >
                <Box w="100%" h={`${QUEUE_TRACK_EL_HEIGHT}px`} mt="1"
                    bg="gray.600"
                    rounded="lg"
                >
                    
                </Box>
            </TouchableWithoutFeedback>
        </ScaleDecorator>
    )
}


export default PlayerQueueElement