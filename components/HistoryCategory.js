import React, { useState, useEffect } from 'react';
import HorizontalCategory from './horizontalCategory/HorizontalCategory';
import HorizontalCategoryElement from './horizontalCategory/HorizontalCategoryElement';

const HistoryCategory = ({
    maxContent=10
}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData([
            {
                id: 1,
                title: "Lorem ipsum"
            },
            {
                id: 2,
                title: "Lorem ipsum dolor sit amet"
            },
            {
                id: 3,
                title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget dapibus justo. Aliquam maximus nisl vitae luctus laoreet. Proin eu scelerisque nisi. Duis et ultrices enim"
            }
        ])
    }, []);

    return (
        <HorizontalCategory 
            render={
                data.slice(0, maxContent).map((el) => <HorizontalCategoryElement title={el.title} key={el.id}/>)
            } 
            title="Istoricul redărilor"/>
    );
};

export default HistoryCategory;
