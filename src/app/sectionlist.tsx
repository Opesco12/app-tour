import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourSectionList, TourTarget, useTour } from "../tour";

type RowItem = { id: string; label: string };
type RowSection = { title: string; data: RowItem[] };

const SectionListScreen = () => {
  const { getTour, hasTour, startTour } = useTour();

  const sections = useMemo<RowSection[]>(
    () => [
      {
        title: "Today",
        data: Array.from({ length: 8 }, (_, i) => ({
          id: `section.0.item.${i + 1}`,
          label: `Today Task ${i + 1}`,
        })),
      },
      {
        title: "Tomorrow",
        data: Array.from({ length: 8 }, (_, i) => ({
          id: `section.1.item.${i + 1}`,
          label: `Tomorrow Task ${i + 1}`,
        })),
      },
    ],
    [],
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>SectionList Tour Example</Text>
      <Text style={styles.subhead}>Demonstrates section + item reveal.</Text>

      <Pressable
        style={styles.button}
        onPress={() => {
          if (!hasTour("sectionlist")) return;
          console.log("[tour] sectionlist steps", getTour("sectionlist")?.length ?? 0);
          startTour("sectionlist");
        }}
      >
        <Text style={styles.buttonText}>Start SectionList Tour</Text>
      </Pressable>

      <TourSectionList
        id="sectionlist-container"
        sections={sections}
        keyExtractor={(item) => item.id}
        getTourTargetId={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const content = (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.label}</Text>
            </View>
          );

          if (item.id === "section.0.item.2" || item.id === "section.1.item.6") {
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
  sectionTitle: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 10,
  },
  cardText: { color: "#0f172a", fontSize: 15, fontWeight: "600" },
});

export default SectionListScreen;
