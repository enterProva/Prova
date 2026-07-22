import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/lib/query-client";
import { SessionProvider, useSession } from "@/providers/session-provider";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isBootstrapping } = useSession();

  useEffect(() => {
    if (!isBootstrapping) {
      void SplashScreen.hideAsync();
    }
  }, [isBootstrapping]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          animation: "slide_from_right",
          headerShown: false,
        }}>
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
