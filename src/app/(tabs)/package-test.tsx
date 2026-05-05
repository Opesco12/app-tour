import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TourProvider, TourTarget, defineTours, useTour } from "react-native-tour-kit";

const packageTours = defineTours({
  "package-smoke": [
    {
      id: "pkg.start",
      target: "pkg.start.button",
      title: "Package Tour Start",
      description: "This step confirms the local tgz package is working in this app.",
      placement: "bottom",
    },
    {
      id: "pkg.card",
      target: "pkg.info.card",
      title: "Second Target",
      description: "This verifies target registration and tooltip navigation.",
      placement: "top",
    },
  ],
});

const PackageTestContent = () => {
  const { startTour } = useTour();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Local Package Smoke Test</Text>
      <Text style={styles.subheading}>
        Running from react-native-tour-kit-1.0.0.tgz
      </Text>

      <TourTarget id="pkg.start.button">
        <Pressable style={styles.button} onPress={() => startTour("package-smoke")}>
          <Text style={styles.buttonText}>Start Package Tour</Text>
        </Pressable>
      </TourTarget>

      <TourTarget id="pkg.info.card">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Package Source</Text>
          <Text style={styles.cardBody}>react-native-tour-kit@1.0.0 (local tgz)</Text>
        </View>
      </TourTarget>
    </View>
  );
};

const PackageTestTab = () => {
  return (
    <TourProvider tours={packageTours} prompt={{ enabled: false }}>
      <PackageTestContent />
    </TourProvider>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 84, paddingHorizontal: 18 },
  heading: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  subheading: { color: "#475569", fontSize: 15, marginBottom: 14 },
  button: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    padding: 14,
  },
  cardTitle: { color: "#0f172a", fontWeight: "700", fontSize: 15, marginBottom: 4 },
  cardBody: { color: "#475569", fontSize: 13 },
});

export default PackageTestTab;
