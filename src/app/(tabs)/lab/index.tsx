import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourTarget, useTour } from "../../../tour";

const LabIndex = () => {
  const { startTour } = useTour();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Nested Stack Lab</Text>
      <Text style={styles.meta}>Used for cross-route + readiness testing.</Text>

      <TourTarget id="lab.start">
        <Pressable style={styles.primary} onPress={() => startTour("nested-lab")}> 
          <Text style={styles.primaryText}>Start Nested Lab Tour</Text>
        </Pressable>
      </TourTarget>

      <TourTarget id="lab.deepLink">
        <Link href="/lab/details" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Open Lab Details</Text>
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

export default LabIndex;
