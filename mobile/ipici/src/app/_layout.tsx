import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/components/useColorScheme';
import AuthLoadingScreen from './AuthLoadingScreen';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'AuthLoadingScreen/index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="AuthLoadingScreen/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="PasswordRecovery/index"
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Register/index"
          options={{ headerShown: false }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
