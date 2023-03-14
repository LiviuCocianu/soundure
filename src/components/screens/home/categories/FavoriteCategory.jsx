import React, { useState } from 'react'

import HorizontalCategory from '../horizontalCategory/HorizontalCategory'
import HorizontalCategoryElement from '../horizontalCategory/HorizontalCategoryElement'

/**
 * FavoriteCategory component
 * 
 * @param {object} props props object
 * @param {number} props.maxContent Maximum amount of content to display in the category
 * 
 * @returns {JSX.Element} JSX component
 */
const FavoriteCategory = ({ maxContent = 10 }) => {
    const renderContent = data.slice(0, maxContent)
        .map((el) => <HorizontalCategoryElement title={el.title} key={el.id}/>);
    
    const [data, setData] = useState([]);

    return (
        <HorizontalCategory title="Piese preferate" render={renderContent}/>
    );
};

export default FavoriteCategory
