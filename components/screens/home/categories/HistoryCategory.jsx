import React, { useState, useEffect, Component } from 'react';
import { useSelector } from 'react-redux';
import Database from '../../../../database';
import HorizontalCategory from '../horizontalCategory/HorizontalCategory';
import HorizontalCategoryElement from '../horizontalCategory/HorizontalCategoryElement';

/**
 * HistoryCategory component
 * @param {object} props props object
 * @param {number} props.maxContent Maximum amount of content to show
 * @param {Database} props.db Database object
 * @returns {Component} Component JSX
 */
const HistoryCategory = ({
    maxContent=10,
    db
}) => {
    /** 
     * We use the playlists content state here to update the component every time the user
     * listens to a track and it gets added to the history playlist
     * */
    const playlistsContent = useSelector(state => state.playlistsContent);
    const tracks = useSelector(state => state.tracks);
    const [historyTracks, setHistoryTracks] = useState([]);

    useEffect(() => {
        // TODO test if this works when user can add tracks
        db.existsWithRows("Playlist", "title = ?", ["_HISTORY"]).then(({exists, rows}) => {
            /** This should always be true normally */
            if (exists) {
                const histPlaylist = rows[0];
                const historyTrackIds = playlistsContent
                    .filter(rel => rel.playlistId === histPlaylist.id)
                    .map(rel => rel.trackId);

                setHistoryTracks(tracks.filter(track => historyTrackIds.includes(track.id)));
            }
        });
    }, [playlistsContent]);

    return (
        <HorizontalCategory 
            render={
                historyTracks.slice(0, maxContent).map((el) => <HorizontalCategoryElement title={el.title} key={el.id}/>)
            } 
            title="Istoricul redărilor"/>
    );
};

export default HistoryCategory;
