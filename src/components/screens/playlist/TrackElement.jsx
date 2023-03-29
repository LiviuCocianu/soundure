import React, { useEffect, useState, memo } from 'react';
import { ImageBackground } from 'react-native';
import { 
    HStack,
    Factory,
    AspectRatio,
    VStack,
    Text,
    Pressable,
    Checkbox,
    useDisclose
} from 'native-base'

import { Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import MarqueeText from 'react-native-marquee'
import { useDispatch, useSelector } from 'react-redux';

import CustomActionsheet, { CustomActionsheetItem } from '../../general/CustomActionsheet';
import ConfirmationWindow from '../../modals/ConfirmationWindow';
import Toast from 'react-native-root-toast';

import { getPlatformIcon, handleCoverURI } from '../../../functions';
import { TRACK_EL_HEIGHT } from '../../../constants';
import db from '../../../database/database';

import { playlistContentRemoved } from '../../../redux/slices/playlistContentSlice';
import { trackSet } from '../../../redux/slices/trackSlice';
import PlatformIcon from '../../general/PlatformIcon';
import { TrackUtils } from '../../../database/componentUtils';


const ImageNB = Factory(ImageBackground);
const EntypoNB = Factory(Entypo);
const AntDesignNB = Factory(AntDesign);
const MaterialCommunityIconsNB = Factory(MaterialCommunityIcons);
const MarqueeNB = Factory(MarqueeText);

/**
 * @callback selectionHandler
 * @param {boolean} isSelected Indicates if the checkbox is checked
 * @param {number} trackId Track ID in database
 */

/**
 * TrackElement component
 * 
 * @param {object} props props object
 * @param {object} props.navigation React Navigation object
 * @param {string|number} props.w Component width
 * @param {number} props.trackId Track ID in database
 * @param {number} props.playlistId ID in database of playlist that currently owns this element
 * @param {boolean} props.selectionMode Indicates if the element is in selection mode
 * @param {boolean} props.allSelected External state that is used to signal this element
 *                                    to check its checkbox. Used for "select all" functionality
 * @param {selectionHandler} props.selectionHandler Callback that triggers when a checkbox has been changed.
 * 
 * @returns {JSX.Element} JSX component
 */
const TrackElement = ({
    navigation,
    w="100%",
    trackId,
    playlistId,
    selectionMode=false,
    allSelected=false,
    selectionHandler=() => {}
}) => {
    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclose();

    const tracks = useSelector(state => state.tracks);
    const artists = useSelector(state => state.artists);
    const dispatch = useDispatch();

    const [track, setTrack] = useState({});
    const [artist, setArtist] = useState({});

    const [isSelected, setSelected] = useState(false);
    const [deletionModal, toggleDeletionModal] = useState(false);

    const favoriteASTitle = !track.favorite ? "Adaugă la favorite" : "Elimină din favorite";
    const favoriteASIcon = !track.favorite ? "star-check" : "archive-star";

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

    const handleSettingsButton = () => {
        onOpen();
    }

    const handleTrackDelete = () => {
        onClose();
        toggleDeletionModal(true);
    }

    const handleTrackFavorite = () => {
        onClose();
        TrackUtils.toggleFavorite(track, dispatch);
    }

    const handleAboutTrack = () => {
        onClose();
        navigation.navigate("Track", {trackId});
    }

    const handleDeletionYes = () => {
        db.selectFrom("PlaylistContent", ["id"], "trackId = ?", [trackId]).then(rows => {
            db.deleteFrom("PlaylistContent", "trackId = ?", [trackId]).then(() => {
                rows.forEach(row => dispatch(playlistContentRemoved(row)));

                Toast.show("Piesă eliminată!", {
                    duration: Toast.durations.LONG,
                    delay: 500
                });
            });
        });
    }

    return (
        <Pressable _pressed={{ opacity: 0.8 }} 
            onPress={handlePress}
        >
            <ConfirmationWindow 
                isOpen={deletionModal}
                toggleVisible={toggleDeletionModal}
                onYes={handleDeletionYes}/>

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
                <TrackCover coverURI={track.coverURI}/>
                <TrackInfo w={w} 
                    title={track.title} 
                    artistName={artist.name}
                    isFavorite={track.favorite}
                    platform={track.platform}/>

                {
                    !selectionMode ? (
                        <EntypoNB mr="2" py="4"
                            onPress={handleSettingsButton}
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

            <CustomActionsheet 
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
                title="Setări piesă"
            >
                <CustomActionsheetItem text="Elimină din playlist"
                    iconName="playlist-minus"
                    IconType={MaterialCommunityIconsNB}
                    onPress={handleTrackDelete}/>

                <CustomActionsheetItem text={favoriteASTitle}
                    iconName={favoriteASIcon}
                    IconType={MaterialCommunityIconsNB}
                    onPress={handleTrackFavorite}/>

                <CustomActionsheetItem text="Despre piesă"
                    iconName="tag"
                    IconType={AntDesignNB}
                    onPress={handleAboutTrack}/>
            </CustomActionsheet>
        </Pressable>
    );
};

// Separate component into smaller memo components for performance
const TrackCover = memo(({coverURI}) => (
    <AspectRatio ratio="4/4" h="auto">
        <ImageNB
            source={handleCoverURI(coverURI)}
            imageStyle={{
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10
            }} />
    </AspectRatio>
), (prev, next) => prev.coverURI == next.coverURI);

const TrackInfo = memo(({w, title, artistName, isFavorite, platform="NONE"}) => {
    return (
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

            <Text color="primary.50"
                fontFamily="manrope_r"
                fontSize="xs">▶ {artistName ? artistName : "Nume artist"}</Text>

            <HStack space={1} mt="1">
                {
                    isFavorite ? (
                        <AntDesignNB 
                        name="star"
                        color="yellow.300"/>
                    ) : (<></>)
                }

                <PlatformIcon platform={platform}/>
            </HStack>
        </VStack>
    )
}, (prev, next) => 
    prev.title == next.title 
    && prev.artistName == next.artistName
    && prev.isFavorite == next.isFavorite
    && prev.platform == next.platform
);


export default TrackElement
