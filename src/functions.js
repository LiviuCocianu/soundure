export function handleCoverURI(coverURI, defaultURI=require("../assets/icon/icon.png")) {
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