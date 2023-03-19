export function handleCoverURI(coverURI, defaultURI=require("../assets/icon/icon.png")) {
    return !coverURI ? defaultURI : { uri: coverURI };
}

export function playlistStatsString(trackCount, totalSeconds) {
    const secondsString = typeof(totalSeconds) != "string" 
        ? totalSeconds.toString() : totalSeconds;
    const secondsTimestamp = secondsString != "0" 
        ? `${secondsString.toHHMMSS()} • ` : ""
    const tracks = trackCount > 1 || trackCount == 0 ? "piese" : "piesă";
    
    return `${secondsTimestamp}${trackCount} ${tracks}`;
}