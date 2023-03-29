import React from 'react';
import { Icon } from 'native-base'

import CustomIcon from "../../icons"
import { PLATFORMS } from "../../constants";


/**
 * PlatformIcon component.
 * 
 * @param {object} props props object
 * @param {string} platform Platforms: SPOTIFY, SOUNDCLOUD, YOUTUBE. Default is NONE 
 * 
 * @returns {JSX.Element} JSX component
 */
const PlatformIcon = ({
    platform="NONE",
    ...props
}) => {
    const platformIconColor = platform == PLATFORMS.SPOTIFY ? "green.300" :
                            platform == PLATFORMS.SOUNDCLOUD ? "orange.300" : "red.400";

    return (
        platform != "NONE" ? (
            <Icon 
                as={<CustomIcon name={`${platform.toLowerCase()}_logo`} size={10}/>} 
                color={platformIconColor} {...props}/>
        ) : (<></>)
    )
};


export default PlatformIcon;
