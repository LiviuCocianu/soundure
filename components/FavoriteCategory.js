//import liraries
import React, { useState, useEffect } from 'react';
import HorizontalCategory from './horizontalCategory/HorizontalCategory';
import HorizontalCategoryElement from './horizontalCategory/HorizontalCategoryElement';

const FavoriteCategory = ({
    maxContent=10
}) => {
    const [data, setData] = useState([]);

    return (
        <HorizontalCategory 
            render={
                data.slice(0, maxContent).map((el) => <HorizontalCategoryElement title={el.title} key={el.id}/>)
            } 
            title="Piese preferate"/>
    );
};

export default FavoriteCategory;
