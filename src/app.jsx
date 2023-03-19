import React, { useEffect, useState } from "react"
import { Factory } from "native-base"

import { useFonts } from 'expo-font'
import { useDispatch, useSelector } from 'react-redux'
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomePage from "./components/screens/home/HomePage"
import LoadingPage from "./components/screens/loading/LoadingPage"
import PlaylistPage, { PlaylistHeader } from "./components/screens/playlist/PlaylistPage"
import fonts from "../fonts"
import { setup } from "./database/index"


const Stack = createNativeStackNavigator();

const App = () => {
  const dispatch = useDispatch();
  const [loadedDatabase, setLoadedDatabase] = useState(false);
  const [loadedFonts] = useFonts(fonts);

  const tracks = useSelector(state => state.tracks);

  useEffect(() => {
    setup(dispatch, setLoadedDatabase);
  }, []);

  if(!loadedFonts || !loadedDatabase) {
    return <LoadingPage/>
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" 
          component={HomePage}
          options={{headerShown: false}}/>

        <Stack.Screen name="Playlist"
          component={PlaylistPage}
          options={{
            header: PlaylistHeader,
            headerTransparent: true,
            headerBackButtonMenuEnabled: false,
            headerBackVisible: false,
            animation: "slide_from_right"
          }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App