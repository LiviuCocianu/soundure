import { StatusBar } from "react-native";
import { NativeBaseProvider, extendTheme } from 'native-base'

import { registerRootComponent } from 'expo';
import { LinearGradient } from "expo-linear-gradient"
import { Provider } from 'react-redux';

import App from './app'
import store from './redux/store'
import themes from "./assets/themes";

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return (parseInt(hours) < 1 ? "" : (hours + ':')) + minutes + ':' + seconds;
}

const config = {
    dependencies: {
        'linear-gradient': LinearGradient
    },
};
  
const theme = extendTheme(themes);

const ReduxApp = () => (
    <Provider store={store}>
        <NativeBaseProvider theme={theme} config={config}>
            <StatusBar />
            <App/>
        </NativeBaseProvider>
    </Provider>
);

registerRootComponent(ReduxApp);
