import { getColorFromURL } from "rn-dominant-color";


const defURI = require("../assets/images/default_cover.png");

/**
 * Verifies if the given cover URI is defined and processes it.
 * 
 * @param {string|NodeRequire} coverURI The cover URI. This can be either a node-required image,
 * an HTTP/HTTPS url or a stringified JSON object that contains the URI
 * @param {string|NodeRequire} [defaultURI] The default URI. Can take the same type
 * of data as the coverURI. It will be used as a fallback if coverURI is undefined
 * 
 * @returns {object|NodeRequire} An object containing the URI of the cover, otherwise
 * returns the default cover
 */
export function handleCoverURI(coverURI, defaultURI=defURI) {
    let modified = coverURI;

    if(typeof(modified) == "string") {
        // Parse from JSON if needed, otherwise it must be an URI string
        try {
            modified = JSON.parse(modified);
        } catch(err) {}
    }

    return !modified ? defaultURI : (modified.uri ? modified : { uri: modified });
}

/**
 * Applies handleCoverURI and extracts the dominant colors from the image accordingly.
 * 
 * @param {string|NodeRequire} coverURI The cover URI. This can be either a node-required image,
 * an HTTP/HTTPS url or a stringified JSON object that contains the URI
 * 
 * @returns {Promise<{primary: string, secondary: string, background: string, detail: string}>} 
 * If the URI is defined, it uses the 'rn-dominant-color' module,
 * otherwise it returns a fixed object of default colors
 */
export function handleColors(coverURI) {
    let modified = handleCoverURI(coverURI);

    if(modified.uri) modified = modified.uri;

    if (modified == defURI) {
        return Promise.resolve(() => ({
            primary: "gray.700",
            secondary: "gray.700",
            background: "gray.900",
            detail: "gray.900"
        }));
    } else {
        return getColorFromURL(coverURI);
    }
}

/**
 * Takes information about a playlist and composes it into a string.
 * 
 * @param {number} trackCount The number of tracks inside the playlist
 * @param {number} totalSeconds The accumulated amount of seconds of all belonging tracks.
 * If there are zero seconds, they won't be included in the composition
 * 
 * @returns {string} Composed information
 */
export function composePlaylistInfo(trackCount, totalSeconds) {
    const secondsString = typeof(totalSeconds) != "string" 
        ? totalSeconds.toString() : totalSeconds;
    const secondsTimestamp = secondsString != "0" 
        ? `${secondsString.toHHMMSS()} • ` : ""
    const tracks = trackCount > 1 || trackCount == 0 ? "piese" : "piesă";
    
    return `${secondsTimestamp}${trackCount} ${tracks}`;
}

/**
 * Builds a linear gradient object to pass as an argument to the background color property.
 * 
 * @param {string[]} colors An array of colors for the gradient. The character 't' can be used as shorthand for 'transparent'
 * @param {('top'|'topright'|'right'|'bottomright'|'bottom'|'bottomleft'|'left'|'topleft')} [direction] Gradient direction.
 * Directions go from the opposite point to the point specified, so if the direction is 'topleft', the gradient starts from
 * the bottom-right side of the container and goes to the top-left. Default is 'right'
 * 
 * @returns {{linearGradient: {colors: string[], start: [number, number], end: [number, number]}}} Linear gradient object
 */
export function lng(colors, direction) {
    const newColors = colors.map(color => color == "t" ? "transparent" : color);
    const vectors = {
        top: [0.5, 0],
        bottom: [0.5, 1],
        left: [0, 0.5],
        right: [1, 0.5],
        topleft: [0, 0],
        topright: [1, 0],
        bottomleft: [0, 1],
        bottomright: [1, 1]
    };

    let start;
    const end = vectors[direction];

    switch(direction) {
        case "top": start = vectors.bottom; break;
        case "bottom": start = vectors.top; break;
        case "left": start = vectors.right; break;
        case "right": start = vectors.left; break;
        case "topleft": start = vectors.bottomright; break;
        case "topright": start = vectors.bottomleft; break;
        case "bottomleft": start = vectors.topright; break;
        case "bottomright": start = vectors.topleft; break;
    }

    return {
        linearGradient: {
            colors: newColors,
            start: !start ? [0, 0.5] : start,
            end: !end ? [1, 0.5] : end
        }
    }
}

/**
 * Takes a list of URLs and tries all of them to see if they lead to a website.
 * The function returns the first valid URL it finds
 * 
 * @param {string[]} urlList List of URLs to try. URLs are prioritized from left to right!
 * 
 * @returns {Promise<string|undefined>} A promise resolving with an URL that
 * connected successfully. If all of them are invalid, it resolves with undefined
 */
export async function firstConnected(urlList) {
    for(const url of urlList) {
        try {
            const res = await fetch(url);
            if (res.ok) return url;
        } catch(error) {
            console.log(`Couldn't connect to URL ${url}: ${error.message}. Skipping to the next available URL`);
        }
    }

    return undefined;
}