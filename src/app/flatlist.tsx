import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourFlatList, TourTarget, useTour } from "../tour";

type FlatItem = {
  id: string;
  title: string;
  openTasks: number;
};

const FlatListScreen = () => {
  const { startTour } = useTour();

  const data = useMemo<FlatItem[]>(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: `flat.item.${index + 1}`,
        title: `Warehouse Batch ${index + 1}`,
        openTasks: index + 3,
      })),
    [],
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>FlatList Tour Example</Text>
      <Text style={styles.subhead}>Demonstrates scrollToTarget with TourFlatList.</Text>

      <Pressable
        style={styles.button}
        onPress={() =>
          startTour([
            {
              id: "flat.start",
              target: "flat.item.2",
              title: "FlatList Start",
              description: "We begin near the top of the list.",
              route: "/flatlist",
            },
            {
              id: "flat.item.10",
              target: "flat.item.10",
              title: "Auto-scroll to 10",
              description: "This step uses container-based reveal for FlatList.",
              route: "/flatlist",
              scrollToTarget: true,
              scrollContainerId: "flatlist-container",
            },
            {
              id: "flat.item.14",
              target: "flat.item.14",
              title: "Auto-scroll to 14",
              description: "A second deep target in the same list.",
              route: "/flatlist",
              scrollToTarget: true,
              scrollContainerId: "flatlist-container",
            },
          ])
        }
      >
        <Text style={styles.buttonText}>Start FlatList Tour</Text>
      </Pressable>

      <TourFlatList
        id="flatlist-container"
        data={data}
        keyExtractor={(item) => item.id}
        getTourTargetId={(item) => item.id}
        renderItem={({ item }) => {
          const content = (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>Open tasks: {item.openTasks}</Text>
            </View>
          );

          if (item.id === "flat.item.2" || item.id === "flat.item.10" || item.id === "flat.item.14") {
            return <TourTarget id={item.id}>{content}</TourTarget>;
          }

          return content;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 90, paddingHorizontal: 20 },
  heading: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  subhead: { fontSize: 15, color: "#475569", marginBottom: 14 },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: { color: "#0f172a", fontWeight: "700", fontSize: 15, marginBottom: 4 },
  cardMeta: { color: "#64748b", fontSize: 13 },
});

export default FlatListScreen;
