import React, { useMemo, useCallback } from 'react'
import { Text, FlatList } from 'native-base';

import { useSelector } from 'react-redux';
import TrackElement from '../screens/playlist/TrackElement';
import NoContentInfo from './NoContentInfo';
import { find } from '../../functions';


/**
 * @callback selectionHandler
 * @param {boolean} isSelected If the track element is selected
 * @param {number} trackId ID for selected track
 * 
 * @callback onInfoPress
 */

/**
 * OptimizedTrackList component
 * 
 * @param {object} props props object
 * @param {object} props.navigation Object generated by React Navigation
 * @param {object[]} props.ownTracks A list of all track IDs
 * @param {object} [props.playlist] Playlist info, if the given tracks are tied to one
 * @param {number} [props.initialRenderCount] The number of tracks to render initially
 * @param {onInfoPress} [props.onInfoPress] Callback that triggers when the "no content info" area is pressed
 * 
 * @param {object} [props.selection] Properties for selection mode
 * @param {boolean} [props.selection.enabled] If selection mode is enabled for all track elements
 * @param {boolean} [props.selection.areAllSelected] If all track elements are selected. This should be
 * a state hook.
 * @param {selectionHandler} [props.selection.selectionHandler] Callback that triggers if a selection happens
 * 
 * @returns {JSX.Element} JSX component
 */
const OptimizedTrackList = ({
    navigation,
    ownTracks,
    playlist,
    onInfoPress=() => { },
    selection={
        enabled: false,
        areAllSelected: false,
        selectionHandler: () => { }
    },
}) => {
    const tracks = useSelector(state => state.tracks);

    const artists = useSelector(state => state.artists);

    const findTrackInfo = useCallback((trackId) => {
        const track = find(tracks, "id", trackId);
        const artist = find(artists, "id", track.artistId);

        return [track, artist];
    }, [ownTracks, tracks, artists]);
    
    const renderElements = useCallback(({ item }) => {
        const [track, artist] = findTrackInfo(item);

        return (
            <TrackElement
                navigation={navigation}
                track={track}
                artist={artist}
                playlistId={playlist.id}
                selectionMode={selection.enabled}
                allSelected={selection.areAllSelected}
                selectionHandler={selection.selectionHandler} />
        )
    }, [playlist.id, selection]);

    const renderMemo = useMemo(() => renderElements, [playlist.id, selection]);

    return <>
        {
            ownTracks.length == 0 ? (
                <NoContentInfo
                    onPress={onInfoPress}
                    subtitle={<><Text underline>Adaugă piese</Text> și începe să asculți</>}
                />
            ) : (
                <FlatList w="100%" pt="2"
                    flexGrow="1"
                    contentContainerStyle={{ 
                        alignItems: "center", 
                        paddingBottom: 10 
                    }}
                    data={ownTracks}
                    renderItem={renderMemo}
                    keyExtractor={(_, index) => `optimizedlistitem_${index}`}
                />
            )
        }
    </>
}

const propsAreEqual = (prev, next) => (
    prev.navigation == next.navigation
    && prev.ownTracks == next.ownTracks
    && prev.playlist == next.playlist
    && prev.initialRenderCount == next.initialRenderCount
    && prev.onInfoPress == next.onInfoPress
    && prev.selection.enabled == next.selection.enabled
    && prev.selection.areAllSelected == next.areAllSelected
    && prev.selection.selectionHandler == next.selectionHandler
);


export default OptimizedTrackList;