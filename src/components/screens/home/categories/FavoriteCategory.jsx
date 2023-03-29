import React, { useState } from 'react'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import HorizontalCategory from '../../../general/HorizontalCategory'
import HorizontalCategoryElement from '../../../general/HorizontalCategoryElement'


/**
 * FavoriteCategory component
 * 
 * @param {object} props props object
 * @param {number} props.maxContent Maximum amount of content to display in the category
 * 
 * @returns {JSX.Element} JSX component
 */
const FavoriteCategory = ({ maxContent = 10 }) => {
    const tracks = useSelector(state => state.tracks);
    const [ownTracks, setOwnTracks] = useState([]);

    const renderContent = ownTracks.slice(0, maxContent)
        .map((el) => (
            <HorizontalCategoryElement 
                title={el.title} 
                coverURI={el.coverURI}
                key={el.id}
            />
        ));

    useEffect(() => {
        setOwnTracks(tracks.filter(tr => tr.favorite));
    }, [tracks]);

    return (
        <HorizontalCategory title="Piese preferate" render={renderContent}/>
    );
};


export default FavoriteCategory
