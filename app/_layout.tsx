import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import './global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, authLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    Grift: require('../assets/fonts/grift-regular.otf'),
    'Grift-Bold': require('../assets/fonts/grift-bold.otf'),
    'Grift-ExtraLight': require('../assets/fonts/grift-extralight.otf'),
    'Grift-Light': require('../assets/fonts/grift-light.otf'),
    'Grift-Black': require('../assets/fonts/grift-black.otf'),
  });

  /**
   * Auth Guard — runs after session check completes.
   *
   * WHY useEffect + router.replace instead of <Redirect>?
   * - authLoading is async. If we render <Redirect> immediately,
   *   it fires before Firebase finishes checking the cached session.
   * - useEffect waits until authLoading is false, THEN redirects.
   *
   * router.replace() vs router.push():
   * - replace() removes the current screen from history stack.
   *   So pressing Back won't bring you back to the loading screen.
   */
  useEffect(() => {
    if (!fontsLoaded || authLoading) return;

    if (user) {
      // User is logged in → go to main app
      router.replace('/(tabs)/home');
    } else {
      // No session → go to welcome/auth flow
      router.replace('/(auth)/welcome');
    }
  }, [user, authLoading, fontsLoaded]);

  // Show a full-screen spinner while checking session + loading fonts
  if (authLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf8f5' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}