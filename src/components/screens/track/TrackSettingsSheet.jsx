import { useState } from "react";
import { Factory } from "native-base";
import { useDispatch } from "react-redux";

import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import ConfirmationWindow from "../../modals/ConfirmationWindow";
import CustomActionsheet, { CustomActionsheetItem } from "../../general/CustomActionsheet";

import { TrackBridge } from '../../../database/componentBridge';


const MaterialCommunityIconsNB = Factory(MaterialCommunityIcons);
const AntDesignNB = Factory(AntDesign);

/**
 * @callback onOpen
 * @callback onClose
 */

/**
 * TrackSettingsSheet component.
 * 
 * Settings sheet used by TrackElement component
 * 
 * @param {object} props props object
 * @param {object} props.navigation Object generated by React Navigation
 * 
 * @param {object} props.payload Object that contains information relating to the track
 * @param {number} [props.payload.playlistId] ID of the referenced playlist containing this track
 * @param {object} props.payload.track Object that contains database information about the track
 * 
 * @param {object} props.discloseObject NativeBase object generated by useDisclose hook
 * @param {boolean} props.discloseObject.isOpen Indicates if the sheet is shown
 * @param {onOpen} props.discloseObject.onOpen Toggles isOpen to true
 * @param {onClose} props.discloseObject.onClose Toggles isClose to false
 * 
 * @returns {JSX.Element} JSX component
 */
const TrackSettingsSheet = ({
    navigation,
    payload: {
        playlistId=undefined,
        track
    },
    discloseObject: {
        isOpen,
        onOpen,
        onClose
    }
}) => {
    const dispatch = useDispatch();

    const [playlistDeletionModal, togglePlaylistDeletionModal] = useState(false);
    const [deletionModal, toggleDeletionModal] = useState(false);

    const favoriteASTitle = !track.favorite ? "Adaugă la favorite" : "Elimină din favorite";
    const favoriteASIcon = !track.favorite ? "star-check" : "archive-star";

    const handlePlaylistExclusion = () => {
        onClose();
        togglePlaylistDeletionModal(true);
    }

    const handleTrackDelete = () => {
        onClose();
        toggleDeletionModal(true);
    }

    const handleTrackFavorite = () => {
        onClose();
        TrackBridge.toggleFavorite(track.id, dispatch);
    }

    const handleAboutTrack = () => {
        onClose();
        navigation.navigate("Track", { trackId: track.id });
    }

    const handlePlaylistDeleteYes = () => {
        TrackBridge.deleteFromPlaylist(playlistId, track.id, dispatch);
    }

    const handleDeletionYes = () => {
        TrackBridge.deleteTrack(track.id, dispatch);
    }

    return (
        <>
            <ConfirmationWindow 
                isOpen={playlistDeletionModal}
                toggleVisible={togglePlaylistDeletionModal}
                onYes={handlePlaylistDeleteYes}/>

            <ConfirmationWindow 
                isOpen={deletionModal}
                toggleVisible={toggleDeletionModal}
                onYes={handleDeletionYes}/>

            <CustomActionsheet 
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
                title="Setări piesă"
            >
                <CustomActionsheetItem text="Despre piesă"
                    iconName="tag"
                    IconType={AntDesignNB}
                    onPress={handleAboutTrack} />

                {
                    playlistId ? (
                        <CustomActionsheetItem text="Elimină din playlist"
                            iconName="playlist-minus"
                            IconType={MaterialCommunityIconsNB}
                            onPress={handlePlaylistExclusion} />
                    ) : (<></>)
                }

                <CustomActionsheetItem text="Elimină permanent"
                    iconName="database-minus"
                    IconType={MaterialCommunityIconsNB}
                    onPress={handleTrackDelete}/>

                <CustomActionsheetItem text={favoriteASTitle}
                    iconName={favoriteASIcon}
                    IconType={MaterialCommunityIconsNB}
                    onPress={handleTrackFavorite}/>
            </CustomActionsheet>
        </>
    )
}


export default TrackSettingsSheet