import React from "react";
import { NativeBaseProvider, extendTheme } from "native-base";
import HomePage from "./components/HomePage";
import LoadingPage from "./components/LoadingPage";
import { StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient"
import { useFonts } from 'expo-font'
import themes from "./assets/themes";

// Define the config
const config = {
  dependencies: {
    'linear-gradient': LinearGradient
  },
};

// extend the theme
const theme = extendTheme(themes); 

export default function App() {
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
  });

  String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {hours = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (parseInt(hours) < 1 ? "" : (hours+':'))+minutes+':'+seconds;
  }

  return (
    <NativeBaseProvider theme={theme} config={config}>
      <StatusBar/>
      {loadedFonts ? <HomePage/> : <LoadingPage/>}
    </NativeBaseProvider> 
  );
}