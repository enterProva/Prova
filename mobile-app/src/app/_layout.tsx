import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useFonts } from "expo-font";
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";

import { queryClient } from "@/lib/query-client";
import { SessionProvider, useSession } from "@/providers/session-provider";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isBootstrapping } = useSession();

  const [fontsLoaded] = useFonts({
    //main font
    Figtree: Figtree_400Regular,
    FigtreeMedium: Figtree_500Medium,
    FigtreeSemiBold: Figtree_600SemiBold,
    FigtreeBold: Figtree_700Bold,

   //accent font
    Serif: require("@/assets/fonts/serif_font.otf"),
  });

  useEffect(() => {
    if (!isBootstrapping && fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [isBootstrapping, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          animation: "slide_from_right",
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="checks/[id]"
          options={{
            headerShown: true,
            title: "Link Analysis",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}