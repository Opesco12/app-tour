import { Stack } from "expo-router";

const SettingsLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="advanced" />
    </Stack>
  );
};

export default SettingsLayout;
