import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { TourTarget, useTour } from "../tour";

const TourDemo = () => {
  const { startTour } = useTour();

  const handleStartTour = () => {
    startTour([
      {
        target: "home.startButton",
        title: "Welcome to the Inventory Dashboard!",
        description:
          "This tour will guide you through the key features of this screen.",
        placement: "top",
      },
      {
        target: "home.button3",
        title: "Another button",
        description:
          "This button doesn't do anything, but it serves as an example of a target outside the scroll view.",
        placement: "top",
      },
      {
        target: "home.item.8",
        title: "Near item (short scroll)",
        description:
          "This item is close, so the tour performs a short auto-scroll.",
        placement: "bottom",
      },
      {
        target: "home.item.24",
        title: "Far item (long scroll)",
        description:
          "This one starts far below the viewport, so the tour auto-scrolls much farther.",
        placement: "bottom",
      },
    ]);
  };

  const items = Array.from({ length: 30 }, (_, index) => index + 1);

  const renderItem = (itemNumber: number) => {
    const id = `home.item.${itemNumber}`;
    const content = (
      <View style={styles.itemCard}>
        <Text style={styles.itemTitle}>Inventory Item #{itemNumber}</Text>
        <Text style={styles.itemMeta}>SKU-{1000 + itemNumber}</Text>
      </View>
    );

    if (itemNumber === 8 || itemNumber === 24) {
      return (
        <TourTarget
          key={id}
          id={id}
        >
          {content}
        </TourTarget>
      );
    }

    return <View key={id}>{content}</View>;
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Inventory Dashboard</Text>

      <TourTarget id="home.startButton">
        <Pressable
          style={styles.startButton}
          onPress={handleStartTour}
        >
          <Text style={styles.startButtonText}>Start Tour</Text>
        </Pressable>
      </TourTarget>

      <Pressable style={styles.startButton}>
        <Text style={styles.startButtonText}>button 2</Text>
      </Pressable>

      <TourTarget id="home.button3">
        <Pressable style={styles.startButton}>
          <Text style={styles.startButtonText}>button 3</Text>
        </Pressable>
      </TourTarget>

      <ScrollView>
        <View style={styles.listContent}>{items.map(renderItem)}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: "#f8fafc",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#0f172a",
  },
  startButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
  },
  itemTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  itemMeta: {
    color: "#64748b",
    fontSize: 13,
  },
});

export default TourDemo;
