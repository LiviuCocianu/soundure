import React, { useState } from 'react';
import HorizontalCategory from '../horizontalCategory/HorizontalCategory';
import HorizontalCategoryElement from '../horizontalCategory/HorizontalCategoryElement';

const FavoriteCategory = ({
    maxContent=10
}) => {
    const [data, setData] = useState([]);

    return (
        <HorizontalCategory 
            title="Piese preferate"
            render={
                data.slice(0, maxContent).map((el) => <HorizontalCategoryElement title={el.title} key={el.id}/>)
            } 
        />
    );
};

export default FavoriteCategory;
