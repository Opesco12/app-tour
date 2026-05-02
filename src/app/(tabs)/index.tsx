import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourScrollView, TourTarget, useTour } from "../../tour";

const HomeTab = () => {
  const {
    clearTourSeen,
    getTour,
    hasTour,
    isTourSeen,
    startTour,
  } = useTour();
  const [dashboardSeen, setDashboardSeen] = useState<boolean>(false);

  useEffect(() => {
    const loadSeen = async () => {
      const seen = await isTourSeen("all-features");
      setDashboardSeen(seen);
    };
    void loadSeen();
  }, [isTourSeen]);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Tour Feature Testbed</Text>
      <Text style={styles.subheading}>
        Validate every feature before packaging.
      </Text>

      <TourTarget id="home.startButton">
        <Pressable style={styles.primaryButton} onPress={() => startTour("all-features")}> 
          <Text style={styles.primaryButtonText}>Start All Features Tour</Text>
        </Pressable>
      </TourTarget>

      <View style={styles.row}>
        <Pressable
          style={styles.ghostButton}
          onPress={() => startTour("all-features", { startAtStepId: "home.item.12" })}
        >
          <Text style={styles.ghostButtonText}>Start Mid Tour</Text>
        </Pressable>
        <Pressable
          style={styles.ghostButton}
          onPress={() => startTour("quick-check", { suppressPrompt: true })}
        >
          <Text style={styles.ghostButtonText}>Suppress Prompt</Text>
        </Pressable>
      </View>

      <TourTarget id="home.storageCard">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Persistence Check</Text>
          <Text style={styles.cardMeta}>all-features seen: {dashboardSeen ? "true" : "false"}</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.smallButton, styles.smallButtonDark]}
              onPress={async () => {
                await clearTourSeen("all-features");
                const seen = await isTourSeen("all-features");
                setDashboardSeen(seen);
              }}
            >
              <Text style={styles.smallButtonTextLight}>Reset Seen</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              onPress={async () => {
                const seen = await isTourSeen("all-features");
                setDashboardSeen(seen);
              }}
            >
              <Text style={styles.smallButtonText}>Refresh Seen</Text>
            </Pressable>
          </View>
        </View>
      </TourTarget>

      <TourTarget id="home.registryCard">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registry Helpers</Text>
          <Text style={styles.cardMeta}>hasTour(all-features): {String(hasTour("all-features"))}</Text>
          <Text style={styles.cardMeta}>steps in quick-check: {getTour("quick-check")?.length ?? 0}</Text>
        </View>
      </TourTarget>

      <TourScrollView
        id="home-scroll"
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: 16 }, (_, index) => index + 1).map((item) => {
          const id = `home.item.${item}`;
          const content = (
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Scenario Item {item}</Text>
              <Text style={styles.listMeta}>Target id: {id}</Text>
            </View>
          );

          if (item === 4 || item === 8 || item === 12 || item === 16) {
            return (
              <TourTarget key={id} id={id}>
                {content}
              </TourTarget>
            );
          }

          return <View key={id}>{content}</View>;
        })}

        <TourTarget id="home.linkRow">
          <View style={styles.linkRow}>
            <Link href="/flat" asChild>
              <Pressable style={styles.navChip}>
                <Text style={styles.navChipText}>Open Flat</Text>
              </Pressable>
            </Link>
            <Link href="/section" asChild>
              <Pressable style={styles.navChip}>
                <Text style={styles.navChipText}>Open Section</Text>
              </Pressable>
            </Link>
            <Link href="/lab" asChild>
              <Pressable style={styles.navChip}>
                <Text style={styles.navChipText}>Open Lab</Text>
              </Pressable>
            </Link>
          </View>
        </TourTarget>
      </TourScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 84, paddingHorizontal: 18 },
  heading: { fontSize: 30, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  subheading: { color: "#475569", fontSize: 15, marginBottom: 14 },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  ghostButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  ghostButtonText: { color: "#0f172a", fontWeight: "600", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { color: "#0f172a", fontWeight: "700", fontSize: 15, marginBottom: 6 },
  cardMeta: { color: "#475569", fontSize: 13, marginBottom: 4 },
  smallButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonDark: { backgroundColor: "#0f172a" },
  smallButtonText: { color: "#0f172a", fontWeight: "700", fontSize: 12 },
  smallButtonTextLight: { color: "#fff", fontWeight: "700", fontSize: 12 },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 8,
  },
  listTitle: { color: "#0f172a", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  listMeta: { color: "#64748b", fontSize: 12 },
  linkRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  navChip: {
    flex: 1,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  navChipText: { color: "#1e3a8a", fontWeight: "700", fontSize: 12 },
});

export default HomeTab;
