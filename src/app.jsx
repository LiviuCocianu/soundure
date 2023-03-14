import React, { useEffect, useState } from "react"

import { useFonts } from 'expo-font'
import { useDispatch } from 'react-redux'
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomePage from "./components/screens/home/HomePage"
import LoadingPage from "./components/screens/LoadingPage"
import { setup } from "./database/index"


const Stack = createNativeStackNavigator();

const App = () => {
  const dispatch = useDispatch();
  const [loadedDatabase, setLoadedDatabase] = useState(false);
  const [loadedFonts] = useFonts({
    'Quicksand-Light': require("./assets/font/Quicksand-Light.ttf"),
    'Quicksand-Regular': require("./assets/font/Quicksand-Regular.ttf"),
    'Quicksand-Medium': require("./assets/font/Quicksand-Medium.ttf"),
    'Quicksand-Bold': require("./assets/font/Quicksand-Bold.ttf"),
    'Manrope-Light': require("./assets/font/Manrope-Light.ttf"),
    'Manrope-LightItalic': require("./assets/font/Manrope-LightItalic.ttf"),
    'Manrope-Regular': require("./assets/font/Manrope-Regular.ttf"),
    'Manrope-Medium': require("./assets/font/Manrope-Medium.ttf"),
    'Manrope-Bold': require("./assets/font/Manrope-Bold.ttf"),
    'IcoMoon': require("./assets/font/icomoon.ttf"),
  });

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
          options={{headerShown: false}} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App