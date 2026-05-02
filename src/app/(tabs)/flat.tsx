import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourFlatList, TourTarget, useTour } from "../../tour";

type Item = { id: string; name: string; value: number };

const FlatTab = () => {
  const { startTour } = useTour();
  const data = useMemo<Item[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: `flat.item.${i + 1}`,
        name: `Flat row ${i + 1}`,
        value: 100 + i,
      })),
    [],
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>FlatList Stress Test</Text>
      <Pressable style={styles.button} onPress={() => startTour("flatlist-only")}> 
        <Text style={styles.buttonText}>Start FlatList Tour</Text>
      </Pressable>

      <TourFlatList
        id="flat-container"
        data={data}
        keyExtractor={(item) => item.id}
        getTourTargetId={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const row = (
            <View style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowMeta}>Metric: {item.value}</Text>
            </View>
          );

          if (item.id === "flat.item.3" || item.id === "flat.item.17" || item.id === "flat.item.24") {
            return <TourTarget id={item.id}>{row}</TourTarget>;
          }

          return row;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 84, paddingHorizontal: 16 },
  heading: { color: "#0f172a", fontWeight: "800", fontSize: 26, marginBottom: 10 },
  button: {
    height: 46,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  rowCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 8,
  },
  rowTitle: { color: "#0f172a", fontWeight: "700", fontSize: 14 },
  rowMeta: { color: "#64748b", fontSize: 12, marginTop: 2 },
});

export default FlatTab;
