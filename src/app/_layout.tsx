import { Stack } from "expo-router";

import { TourProvider } from "../tour";

const AppLayout = () => {
  return (
    <TourProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TourProvider>
  );
};

export default AppLayout;
