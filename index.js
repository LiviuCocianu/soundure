import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import store from './redux/store'

import App from './App';

const ReduxApp = () => (
    <Provider store={store}>
        <App/>
    </Provider>
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(ReduxApp);
