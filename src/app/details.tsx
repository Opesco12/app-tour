import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourTarget } from "../tour";
import { setTourReady } from "../shared/tourReadiness";

const DetailsScreen = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTourReady("details.loaded", false);

    const timer = setTimeout(() => {
      setLoading(false);
      setTourReady("details.loaded", true);
    }, 1400);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Inventory Details</Text>
      <Text style={styles.subhead}>
        {loading ? "Loading warehouse analytics..." : "Warehouse analytics ready."}
      </Text>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Top Alert</Text>
        <Text style={styles.metricValue}>Cold Storage A2</Text>
        <Text style={styles.metricMeta}>Temperature drift detected 12 minutes ago.</Text>
      </View>

      <TourTarget id="details.primaryCta">
        <Pressable style={styles.ctaButton} onPress={() => router.back()}>
          <Text style={styles.ctaText}>Return to Dashboard</Text>
        </Pressable>
      </TourTarget>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 96,
    paddingHorizontal: 20,
  },
  heading: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 12,
  },
  subhead: {
    color: "#475569",
    fontSize: 16,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 20,
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 8,
  },
  metricValue: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  metricMeta: {
    color: "#475569",
    fontSize: 14,
  },
  ctaButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default DetailsScreen;
