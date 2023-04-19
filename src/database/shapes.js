import { PLATFORMS } from "../constants";


/**
 * Creates a simple track object
 * 
 * @param {string} title 
 * @param {string} fileURI 
 * @param {string} [platform] 
 * @param {number} [millis] 
 */
export const createTrack = (title, fileURI, platform=PLATFORMS.NONE, millis=0) => {
    return {title, fileURI, platform, millis};
}

/**
 * Creates a simple playlist object
 * 
 * @param {string} title 
 * @param {string} [description] 
 * @param {string} [coverURI]
 */
export const createPlaylist = (title, description="", coverURI) => {
    return {title, description, coverURI}
}