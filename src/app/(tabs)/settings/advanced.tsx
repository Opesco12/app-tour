import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourTarget } from "../../../tour";

const SettingsAdvanced = () => {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Advanced Settings</Text>
      <Text style={styles.meta}>Used for replace navigation and route chaining.</Text>

      <TourTarget id="settings.advancedCta">
        <Pressable style={styles.button} onPress={() => router.replace("/settings")}> 
          <Text style={styles.buttonText}>Replace to Settings Root</Text>
        </Pressable>
      </TourTarget>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 90, paddingHorizontal: 18 },
  heading: { color: "#0f172a", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  meta: { color: "#475569", marginBottom: 14 },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});

export default SettingsAdvanced;
