import React from 'react'
import { Box, Text, Factory, HStack } from 'native-base'

import OptimizedTrackList from '../../general/OptimizedTrackList'

import { StackActions } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { lng } from '../../../functions'


const FeatherNB = Factory(Feather);

/**
 * TracksPreviewPage component
 * 
 * @param {object} props props object
 * @param {object} props.navigation Object generated by React Navigation
 * @param {object} props.route
 * @param {object} props.route.params
 * @param {number[]} props.route.params.title Header title
 * @param {number[]} props.route.params.trackIDs List of track IDs to be rendered
 * 
 * @returns {JSX.Element} JSX component
 */
const TracksPreviewPage = ({
    navigation,
    route: { params: { title="", trackIDs } }
}) => {
    return (
        <Box w="100%" h="100%"
            bg={lng(["gray.700", "black"], "bottom")}
        >
            <HStack w="100%" h="16%" pl="6" pt="12"
                bg={lng(["primary.900", "primary.500"], "bottom")}
            >
                <Box h="100%" justifyContent="center">
                    <Text color="white"
                        fontFamily="quicksand_b"
                        fontSize="lg">{title}</Text>
                </Box>
            </HStack>

            <OptimizedTrackList 
                navigation={navigation}
                ownTracks={trackIDs}/>
        </Box>
    )
}

export const TracksPreviewHeader = ({ navigation, route }) => {
    const handleBack = () => {
        navigation.dispatch(StackActions.pop());
    }

    return (
        <Box w="100%">
            <HStack h="16" alignItems="center">
                <FeatherNB h="auto" ml="4"
                    onPress={handleBack}
                    color="primary.50"
                    name="arrow-left"
                    fontSize={30}
                    shadow={5} />
            </HStack>
        </Box>
    )
};


export default TracksPreviewPage