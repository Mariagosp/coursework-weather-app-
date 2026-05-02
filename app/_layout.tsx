import { Stack } from "expo-router";
import "react-native-reanimated";
import AuthProvider from "../providers/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="weather-details" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
