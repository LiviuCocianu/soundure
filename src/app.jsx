import React, { useEffect, useState } from "react"
import { AspectRatio, HStack, Image, Text, VStack } from "native-base"

import { LogBox } from "react-native"
import { useFonts } from 'expo-font'
import { useDispatch, useSelector } from 'react-redux'
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import TrackPlayer, { RepeatMode } from "react-native-track-player"
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from "@react-navigation/drawer"

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
import themes from "./themes"
import AppSettings from "./components/screens/drawer/AppSettings"
import { memo } from "react"
import { useMemo } from "react"
import { useCallback } from "react"


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
    const dispatch = useDispatch();

    const [loadedFonts] = useFonts(fonts);
    const [loadedDatabase, setLoadedDatabase] = useState(false);
    const [loadedTrackPlayer, setLoadedTrackPlayer] = useState(false);

    const tracks = useSelector(state => state.tracks);
    const queue = useSelector(state => state.queue);
    const currentConfig = useSelector(state => state.playlistConfig);

    const HomeStack = () => {
        return (
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
        );
    }

    const CustomDrawer = (props) => {
        return (
            <DrawerContentScrollView {...props}>
                <HStack w="100%" p="2" px="4" space="2" bg="primary.700"
                    alignItems="center"
                    justifyContent="flex-end"
                >
                    <VStack justifyContent="flex-start" flexGrow={0.8}>
                        <Text color="white"
                            fontFamily="quicksand_b"
                            fontSize="md">Soundure</Text>

                        <Text color="white"
                            fontFamily="manrope_r"
                            fontSize="2xs">Credits: C. Liviu-Ionuț</Text>
                    </VStack>

                    <AspectRatio ratio="4/4" h="10" flexGrow={0.2}>
                        <Image w="100%" h="100%"
                            source={require("../assets/images/soundure_logo_white.png")}
                            alt="drawer logo" />
                    </AspectRatio>
                </HStack>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
        );
    };

    const NavigationApp = () => (
        <NavigationContainer>
            <Drawer.Navigator
                initialRouteName="MainHome"
                drawerContent={(props) => <CustomDrawer {...props} />}
                screenOptions={{
                    drawerStyle: {
                        backgroundColor: themes.colors.primary["600"]
                    },
                    drawerActiveBackgroundColor: "transparent",
                    drawerActiveTintColor: "white",
                    drawerInactiveTintColor: "white"
                }}
            >
                <Drawer.Screen
                    name="MainHome"
                    component={HomeStack}
                    options={{ headerShown: false, title: "Acasă" }} />

                <Drawer.Screen
                    name="AppSettings"
                    component={AppSettings}
                    options={{ headerShown: false, title: "Setări" }} />
            </Drawer.Navigator>
        </NavigationContainer>
    );

    const MemoizedNavigation = useCallback(() => <NavigationApp/>, []);

    useEffect(() => {
        (async () => {
            await setupDatabase(dispatch);
            setLoadedDatabase(true);
        })();

        LogBox.ignoreLogs([
            "We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320",
            "Error: Please call start before stopping recording"
        ]);
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

                    if (currentConfig.isLooping)
                        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
                    else
                        await TrackPlayer.setRepeatMode(RepeatMode.Off);
                }

                setLoadedTrackPlayer(isSetup);
            })();
        }
    }, [currentConfig, queue, loadedDatabase]);

    if (!loadedFonts || !loadedDatabase || !loadedTrackPlayer) {
        return <LoadingPage />
    }

    return (
        <>
            <MemoizedNavigation/>

            <MusicPlayer/>
        </>
    );
}


export default App