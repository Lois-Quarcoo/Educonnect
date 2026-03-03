import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {useFonts} from 'expo-font';
import "./global.css"

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({
      Grift: require("../assets/fonts/grift-regular.otf"),
    "Grift-Bold": require("../assets/fonts/grift-bold.otf"),
    "Grift-ExtraLight": require("../assets/fonts/grift-extralight.otf"),
    "Grift-Light": require("../assets/fonts/grift-light.otf"),
   "Grift-Black": require("../assets/fonts/grift-black.otf"),
    }); 
     if (!fontsLoaded) {
      return null;
     }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
