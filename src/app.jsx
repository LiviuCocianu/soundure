import React, { useEffect, useState } from "react"

import { useFonts } from 'expo-font'
import { useDispatch, useSelector } from 'react-redux'
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomePage from "./components/screens/home/HomePage"
import LoadingPage from "./components/screens/loading/LoadingPage"
import PlaylistPage, { PlaylistHeader } from "./components/screens/playlist/PlaylistPage"
import TrackListPage, { TrackListHeader } from "./components/screens/tracklist/TrackListPage"
import TrackPage, { TrackHeader } from "./components/screens/track/TrackPage"

import fonts from "../fonts"
import { setupDatabase } from "./database/index"
import { setupPlayer } from "./sound/service"
import TracksPreviewPage, { TracksPreviewHeader } from "./components/screens/trackspreview/TracksPreviewPage"
import MusicPlayer from "./components/screens/player/MusicPlayer"
import { loadTracks, skipTo } from "./sound/orderPanel/playFunctions"
import TrackPlayer from "react-native-track-player"


const Stack = createNativeStackNavigator();

const App = () => {
    const dispatch = useDispatch();

    const [loadedFonts] = useFonts(fonts);
    const [loadedDatabase, setLoadedDatabase] = useState(false);
    const [loadedTrackPlayer, setLoadedTrackPlayer] = useState(false);

    const tracks = useSelector(state => state.tracks);
    const queue = useSelector(state => state.queue);

    useEffect(() => {
        (async () => {
            await setupDatabase(dispatch);
            setLoadedDatabase(true);
        })();
    }, []);

    // Load the state of the music player from the database
    useEffect(() => {
        if(loadedDatabase && !loadedTrackPlayer && queue.synced) {
            (async () => {
                const isSetup = await setupPlayer();

                // Checking if there was a config saved from a previous playback
                // to load back
                if(queue.playlistConfigId != -1) {
                    await loadTracks(queue.orderMap, tracks);
                    await skipTo(queue.currentIndex, dispatch, false);
                    await TrackPlayer.seekTo(Math.floor(queue.currentMillis / 1000));
                }

                setLoadedTrackPlayer(isSetup);
            })();
        }
    }, [queue, loadedDatabase]);

    if (!loadedFonts || !loadedDatabase || !loadedTrackPlayer) {
        return <LoadingPage />
    }

    return (
        <>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen name="Home"
                        component={HomePage}
                        options={{ headerShown: false }} />

                    <Stack.Screen name="Playlist"
                        component={PlaylistPage}
                        options={{
                            header: PlaylistHeader,
                            headerTransparent: true,
                            headerBackButtonMenuEnabled: false,
                            headerBackVisible: false,
                            animation: "slide_from_right"
                        }} />

                    <Stack.Screen name="TrackList"
                        component={TrackListPage}
                        options={{
                            header: TrackListHeader,
                            headerTransparent: true,
                            headerBackButtonMenuEnabled: false,
                            headerBackVisible: false,
                            animation: "slide_from_right"
                        }} />

                    <Stack.Screen name="TracksPreview"
                        component={TracksPreviewPage}
                        options={{
                            header: TracksPreviewHeader,
                            headerTransparent: true,
                            headerBackButtonMenuEnabled: false,
                            headerBackVisible: false,
                            animation: "slide_from_right"
                        }} />

                    <Stack.Screen name="Track"
                        component={TrackPage}
                        options={{
                            header: TrackHeader,
                            headerTransparent: true,
                            headerBackButtonMenuEnabled: false,
                            headerBackVisible: false,
                            animation: "slide_from_right"
                        }} />
                </Stack.Navigator>
            </NavigationContainer>

            <MusicPlayer/>
        </>
    );
}


export default App