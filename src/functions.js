// TODO document these functions

export function handleCoverURI(coverURI, defaultURI=require("../assets/images/default_cover.png")) {
    let modified = coverURI;

    if(typeof(modified) == "string") {
        // Parse from JSON if needed, otherwise it must be an URI string
        try {
            modified = JSON.parse(modified);
        } catch(err) {}
    }

    return !modified ? defaultURI : (modified.uri ? modified : { uri: modified });
}

export function playlistStatsString(trackCount, totalSeconds) {
    const secondsString = typeof(totalSeconds) != "string" 
        ? totalSeconds.toString() : totalSeconds;
    const secondsTimestamp = secondsString != "0" 
        ? `${secondsString.toHHMMSS()} • ` : ""
    const tracks = trackCount > 1 || trackCount == 0 ? "piese" : "piesă";
    
    return `${secondsTimestamp}${trackCount} ${tracks}`;
}

/**
 * Outputs linear gradient object
 * 
 * @param {string[]} colors 
 * @param {('top'|'topright'|'right'|'bottomright'|'bottom'|'bottomleft'|'left'|'topleft')} [direction] Gradient direction.
 * Directions go from the opposite point to the point specified, so if the direction is 'topleft', the gradient starts from
 * the bottom-right side of the container and goes to the top-left. Default is 'right'
 * 
 * @returns {object}
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