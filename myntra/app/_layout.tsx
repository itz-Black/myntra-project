import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "../theme/themeContext";
import { registerForPushNotificationsAsync, schedulePromoReminder } from "../services/NotificationService";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const router = useRouter();

  // ── Request push permissions & schedule daily promo reminder ─────────────
  useEffect(() => {
    (async () => {
      try {
        await registerForPushNotificationsAsync();
        await schedulePromoReminder();
      } catch (e) {
        // Non critical — silently continue if notifications aren't supported
        console.log("Notification setup skipped:", e);
      }
    })();
  }, []);

  // ── Handle notification taps (background / killed state deep-link) ────────
  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.route) {
        router.push(data.route as any);
      }
    });
    return () => {
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            {/* <Stack.Screen name="(auth)" /> */}
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
