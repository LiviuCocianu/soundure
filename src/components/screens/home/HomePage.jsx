import React, { useState } from 'react'
import { Box, Button, ScrollView, Icon } from 'native-base'

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faFolderPlus, faPlus } from '@fortawesome/free-solid-svg-icons'

import CreatePlaylist from '../../modals/CreatePlaylist'
import FavoriteCategory from './categories/FavoriteCategory'
import HistoryCategory from './categories/HistoryCategory'
import PlaylistsCategory from './categories/PlaylistsCategory'
import QuoteBox from './QuoteBox'
import UploadTrack from '../../modals/UploadTrack'
import TracksCategory from './categories/TracksCategory'


/**
 * HomePage component
 * 
 * @param {object} props props object
 * @param {object} props.navigation navigation object
 * 
 * @returns {JSX.Element} JSX component
 */
const HomePage = ({ navigation }) => {
    const [createModalOpened, toggleCreateModal] = useState(false);
    const [uploadModalOpened, toggleUploadModal] = useState(false);

    const navigateToPlaylist = (playlistId) => {
        navigation.navigate("Playlist", { playlistId });
    }

    return (
        <Box w="100%" h="100%" bg="black">
            <ScrollView w="100%" h="100%"
                _contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Modals */}
                <CreatePlaylist isOpen={createModalOpened}
                    closeHandle={toggleCreateModal} />

                <UploadTrack isOpen={uploadModalOpened}
                    closeHandle={toggleUploadModal} />

                {/* Content */}
                <QuoteBox />
                <Box w="100%" h="100%" pb="15"
                    position="relative"
                    bottom={2}
                    bg="black"
                    alignItems="center"
                    borderTopLeftRadius="2xl"
                    borderTopRightRadius="2xl"
                    zIndex={5}
                >
                    <Box w="90%" h="50" mt="6"
                        flex="1"
                        flexGrow="0"
                        flexDir="row"
                        justifyContent="space-around"
                    >
                        <HeaderButton
                            text="Creează playlist"
                            icon={faFolderPlus} onPress={() => toggleCreateModal(true)} />

                        <HeaderButton
                            text="Adaugă o piesă"
                            icon={faPlus} onPress={() => toggleUploadModal(true)} />
                    </Box>

                    <PlaylistsCategory navigation={navigation} navigateToPlaylist={navigateToPlaylist} />
                    <TracksCategory navigation={navigation} />
                    <HistoryCategory navigation={navigation} />
                    <FavoriteCategory navigation={navigation} />
                </Box>
            </ScrollView>
        </Box>
    )
}

const HeaderButton = ({ text, icon, onPress }) => (
    <Button bg="transparent"
        onPress={onPress}
        borderColor="white"
        borderWidth="1"
        borderRadius="lg"
        size="sm"
        _text={{ fontFamily: "quicksand_r" }}
        android_ripple={{ color: "primary.50" }}
        _ios={{
            _pressed: { bg: "primary.500:alpha.40" }
        }}
        leftIcon={<Icon as={FontAwesomeIcon} icon={icon} color="primary.500"></Icon>}
    >{text}</Button>
)


export default HomePage