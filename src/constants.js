import { QUOTE_API_KEY } from "@env";
import { Dimensions } from "react-native";


const SCREEN_HEIGHT = Dimensions.get("screen").height;


export const ENV = {
    QUOTE_API_KEY
};

export const TABLES = {
    ARTIST: "Artist",
    PLAYLIST: "Playlist",
    PLAYLIST_CONFIG: "PlaylistConfig",
    TRACK: "Track",
    TRACK_CONFIG: "TrackConfig",
    PLAYLIST_CONTENT: "PlaylistContent",
    QUEUE: "Queue",
    QUOTE: "Quote",
    SETTINGS: "Settings",
};

export const PLATFORMS = {
    NONE: "NONE",
    SPOTIFY: "SPOTIFY",
    SOUNDCLOUD: "SOUNDCLOUD",
    YOUTUBE: "YOUTUBE"
};

export const ORDER_MUTATION_OPTIONS = {
    LOOP: "LOOP",
    SHUFFLE: "SHUFFLE",
    REVERSE: "REVERSE"
}

export const APP_SETTINGS = {
    DYNAMIC_MIN_VOLUME: "0.2",
    DYNAMIC_MAX_VOLUME: "0.8",
    DYNAMIC_SENSITIVITY: "40000"
}

export const QUOTE_API_URL = "https://api.api-ninjas.com/v1/quotes?category=inspirational";
export const RESERVED_PLAYLISTS = ["_HISTORY"];
export const TRACK_EL_HEIGHT = 85;
export const QUEUE_TRACK_EL_HEIGHT = 65;
export const PLAYER_UP_HEIGHT = SCREEN_HEIGHT * 0.7;
export const PLAYER_DOWN_HEIGHT = SCREEN_HEIGHT * 0.08;
export const SCREEN_WITH_PLAYER_HEIGHT = SCREEN_HEIGHT - PLAYER_DOWN_HEIGHT * 1.7;
export const ARTIST_NAME_PLACEHOLDER = "Necunoscut";

/**
 * Can range between 0 and 1. The smaller it is, the more compressed all images
 * chosen through an image picker will be
 */
export const IMAGE_QUALITY = 0.5;

export const DEFAULT_QUOTE = {
    CONTENT: "There's nothing like music to relieve the soul and uplift it.",
    AUTHOR: "Mickey Hart"
}
