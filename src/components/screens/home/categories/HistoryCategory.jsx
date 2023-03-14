import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import HorizontalCategory from '../../../general/HorizontalCategory'
import HorizontalCategoryElement from '../../../general/HorizontalCategoryElement'
import db from "../../../../database/database"

/**
 * HistoryCategory component
 * 
 * @param {object} props props object
 * @param {number} props.maxContent Maximum amount of content to display in the category
 * 
 * @returns {JSX.Element} JSX component
 */
const HistoryCategory = ({ maxContent = 10 }) => {
    /** 
     * We use the playlists content state here to update the component every time the user
     * listens to a track and it gets added to the history playlist
     * */
    const playlistsContent = useSelector(state => state.playlistsContent);
    const playlists = useSelector(state => state.playlists);
    const tracks = useSelector(state => state.tracks);
    const [historyTracks, setHistoryTracks] = useState([]);
    
    const renderContent = historyTracks.slice(0, maxContent)
        .map((el) => <HorizontalCategoryElement title={el.title} key={el.id}/>);
    
    useEffect(() => {
        // TODO test if this works when user can add tracks
        const histPlaylist = playlists.find(pl => pl.title == "_HISTORY");

        if(histPlaylist) {
            const historyTrackIds = playlistsContent
                .filter(rel => rel.playlistId === histPlaylist.id)
                .map(rel => rel.trackId);

            setHistoryTracks(tracks.filter(track => historyTrackIds.includes(track.id)));
        }
    }, [playlistsContent]);

    return (
        <HorizontalCategory title="Istoricul redărilor" render={renderContent}/>
    );
};

export default HistoryCategory
