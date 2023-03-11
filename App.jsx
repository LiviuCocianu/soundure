import React, { useEffect, useState } from "react";
import { NativeBaseProvider, extendTheme } from "native-base";
import HomePage from "./components/screens/home/HomePage";
import LoadingPage from "./components/screens/LoadingPage";
import { StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient"
import { useFonts } from 'expo-font'
import themes from "./assets/themes";
import Database from './database'

import { useDispatch } from 'react-redux';
import { playlistsSet } from './redux/slices/playlistSlice'

const config = {
  dependencies: {
    'linear-gradient': LinearGradient
  },
};

const theme = extendTheme(themes);
const db = new Database();

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
    db.init().then(() => {
        db.valuesOf("Playlist");
        db.selectFrom("Playlist").then(rows => dispatch(playlistsSet(rows)));
      }).then(() => setLoadedDatabase(true));
  }, []);

  return (
    <NativeBaseProvider theme={theme} config={config}>
      <StatusBar />
      {(loadedFonts && loadedDatabase) ? <HomePage db={db} /> : <LoadingPage />}
    </NativeBaseProvider>
  );
}

export default App;