import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getTourReady, setTourReady } from "../../../shared/tourReadiness";
import { TourTarget } from "../../../tour";

const LabDetails = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTourReady("lab.details.ready", false);

    const timer = setTimeout(() => {
      setLoading(false);
      setTourReady("lab.details.ready", true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Lab Details</Text>
      <Text style={styles.meta}>readiness key: {String(getTourReady("lab.details.ready"))}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{loading ? "Loading async module..." : "Module loaded"}</Text>
        <Text style={styles.cardMeta}>This screen intentionally delays readiness.</Text>
      </View>

      {loading ? (
        <View style={[styles.button, styles.buttonDisabled]}>
          <Text style={styles.buttonText}>Preparing...</Text>
        </View>
      ) : (
        <TourTarget id="lab.details.cta">
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </Pressable>
        </TourTarget>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 90, paddingHorizontal: 18 },
  heading: { color: "#0f172a", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  meta: { color: "#64748b", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: { color: "#0f172a", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cardMeta: { color: "#475569", fontSize: 13 },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: "#fff", fontWeight: "700" },
});

export default LabDetails;
