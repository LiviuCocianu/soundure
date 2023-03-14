import React, { useEffect, useState } from "react"

import { useFonts } from 'expo-font'
import { useDispatch } from 'react-redux'
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomePage from "./components/screens/home/HomePage"
import LoadingPage from "./components/screens/loading/LoadingPage"
import fonts from "../fonts"
import { setup } from "./database/index"


const Stack = createNativeStackNavigator();

const App = () => {
  const dispatch = useDispatch();
  const [loadedDatabase, setLoadedDatabase] = useState(false);
  const [loadedFonts] = useFonts(fonts);

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