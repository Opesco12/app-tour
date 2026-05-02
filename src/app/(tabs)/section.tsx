import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourSectionList, TourTarget, useTour } from "../../tour";

type SectionItem = { id: string; label: string };
type SectionData = { title: string; data: SectionItem[] };

const SectionTab = () => {
  const { startTour } = useTour();

  const sections = useMemo<SectionData[]>(
    () => [
      {
        title: "Critical",
        data: Array.from({ length: 8 }, (_, i) => ({
          id: `section.0.item.${i + 1}`,
          label: `Critical task ${i + 1}`,
        })),
      },
      {
        title: "Planned",
        data: Array.from({ length: 10 }, (_, i) => ({
          id: `section.1.item.${i + 1}`,
          label: `Planned task ${i + 1}`,
        })),
      },
    ],
    [],
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>SectionList Stress Test</Text>
      <Pressable style={styles.button} onPress={() => startTour("sectionlist-only")}> 
        <Text style={styles.buttonText}>Start SectionList Tour</Text>
      </Pressable>

      <TourSectionList
        id="section-container"
        sections={sections}
        keyExtractor={(item) => item.id}
        getTourTargetId={(item) => item.id}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => {
          const row = (
            <View style={styles.rowCard}>
              <Text style={styles.rowText}>{item.label}</Text>
            </View>
          );

          if (item.id === "section.0.item.2" || item.id === "section.1.item.7") {
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
  sectionTitle: { color: "#334155", fontWeight: "700", marginVertical: 8 },
  rowCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 8,
  },
  rowText: { color: "#0f172a", fontWeight: "600", fontSize: 14 },
});

export default SectionTab;
