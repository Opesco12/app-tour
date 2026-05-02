import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === "index"
              ? "home"
              : route.name === "flat"
                ? "list"
                : route.name === "section"
                  ? "grid"
                  : route.name === "lab"
                    ? "flask"
                    : "settings";
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="flat" options={{ title: "FlatList" }} />
      <Tabs.Screen name="section" options={{ title: "SectionList" }} />
      <Tabs.Screen name="lab" options={{ title: "Lab" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
};

export default TabsLayout;
