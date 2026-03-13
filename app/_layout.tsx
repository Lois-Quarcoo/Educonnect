import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "./global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  const [fontsLoaded] = useFonts({
    Grift: require("../assets/fonts/grift-regular.otf"),
    "Grift-Bold": require("../assets/fonts/grift-bold.otf"),
    "Grift-ExtraLight": require("../assets/fonts/grift-extralight.otf"),
    "Grift-Light": require("../assets/fonts/grift-light.otf"),
    "Grift-Black": require("../assets/fonts/grift-black.otf"),
  });

  useEffect(() => {
    if (!fontsLoaded || loading) return;

    if (user) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/(auth)/welcome");
    }
  }, [user, loading, fontsLoaded]);

  if (loading || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#faf8f5",
        }}
      >
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Subject / lesson screens — full-screen, no header (have their own) */}
        <Stack.Screen name="lesson/[id]" options={{ headerShown: false }} />

        {/* Quiz screen — full-screen with its own header */}
        <Stack.Screen name="quiz/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/index" options={{ headerShown: false }} />

        {/* PDF viewer — modal */}
        <Stack.Screen
          name="pdf-viewer"
          options={{ headerShown: false, presentation: "modal" }}
        />

        {/* AI features — modal */}
        <Stack.Screen
          name="ai-features"
          options={{ headerShown: false, presentation: "modal" }}
        />

        {/* Video player */}
        <Stack.Screen
          name="video/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}