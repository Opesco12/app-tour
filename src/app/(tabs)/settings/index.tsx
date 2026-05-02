import { Link } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useState } from "react";

import { TourTarget, useTour } from "../../../tour";

const SettingsIndex = () => {
  const [enabled, setEnabled] = useState(false);
  const { startTour } = useTour();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.meta}>Use this screen for interaction and replace-route steps.</Text>

      <TourTarget id="settings.toggle">
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Alerts Enabled</Text>
            <Text style={styles.rowMeta}>allowInteractionWithTarget test</Text>
          </View>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
      </TourTarget>

      <TourTarget id="settings.start">
        <Pressable style={styles.primary} onPress={() => startTour("settings-only")}> 
          <Text style={styles.primaryText}>Start Settings Tour</Text>
        </Pressable>
      </TourTarget>

      <TourTarget id="settings.advancedLink">
        <Link href="/settings/advanced" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Open Advanced Settings</Text>
          </Pressable>
        </Link>
      </TourTarget>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 90, paddingHorizontal: 18 },
  heading: { color: "#0f172a", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  meta: { color: "#475569", marginBottom: 14 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: { color: "#0f172a", fontWeight: "700", fontSize: 15 },
  rowMeta: { color: "#64748b", fontSize: 12 },
  primary: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondary: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: { color: "#1e3a8a", fontWeight: "700" },
});

export default SettingsIndex;
