import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './store/indexSimple';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthProvider from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { SocketProvider } from './contexts/SocketContext';

import AuthNavigator from './navigation/AuthNavigator';
import StoreAuthNavigator from './navigation/StoreAuthNavigator';
import MainNavigator from './navigation/MainNavigator';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <LocationProvider>
          <SocketProvider>
            <AuthProvider>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="Auth" component={AuthNavigator} />
                  <Stack.Screen name="StoreAuth" component={StoreAuthNavigator} />
                  <Stack.Screen name="Main" component={MainNavigator} />
                </Stack.Navigator>
              </NavigationContainer>
            </AuthProvider>
          </SocketProvider>
        </LocationProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
