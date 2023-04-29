import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';

import HorizontalCategory from '../../../general/HorizontalCategory'


/**
 * FavoriteCategory component
 * 
 * @param {object} props props object
 * @param {object} props.navigation Object generated by React Navigation
 * @param {number} props.maxContent Maximum amount of content to display in the category
 * 
 * @returns {JSX.Element} JSX component
 */
const FavoriteCategory = ({ 
    navigation,
    maxContent=10
}) => {
    const tracks = useSelector(state => state.tracks);
    const favoriteTracks = useMemo(() => {
        return tracks.filter(tr => tr.favorite);
    }, [tracks]);

    return (
        <HorizontalCategory 
            navigation={navigation}
            title="Piese preferate" 
            tracks={favoriteTracks}
            maxContent={maxContent}/>
    );
};


export default FavoriteCategory
