import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourTarget, useTour } from "../tour";

const TourDemo = () => {
  const { startTour } = useTour();

  const handleStartTour = () => {
    startTour([
      {
        target: "home.createButton",
        title: "Create a new item",
        description: "Tap here to add your first product.",
        placement: "top",
        allowInteractionWithTarget: true,
      },
      {
        target: "home.searchInput",
        title: "Search quickly",
        description: "Use this to find products, orders, or customers.",
        placement: "bottom",
      },
      {
        target: "home.salesCard",
        title: "View sales summary",
        description: "This card shows your most important sales information.",
        placement: "bottom",
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Inventory Dashboard</Text>

      <View style={{ marginBottom: 20 }}>
        <TourTarget id="home.searchInput">
          <View style={styles.searchBox}>
            <Text style={styles.searchText}>Search products...</Text>
          </View>
        </TourTarget>
      </View>

      <TourTarget id="home.salesCard">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today’s Sales</Text>
          <Text style={styles.cardAmount}>₦245,000</Text>
        </View>
      </TourTarget>

      <View style={styles.spacer} />

      <TourTarget id="home.createButton">
        <Pressable
          onPress={() => console.log("add button pressed again")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add Product</Text>
        </Pressable>
      </TourTarget>

      <Pressable
        style={styles.startButton}
        onPress={handleStartTour}
      >
        <Text style={styles.startButtonText}>Start Tour</Text>
      </Pressable>
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
  searchBox: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  searchText: {
    color: "#64748b",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    color: "#64748b",
    fontSize: 16,
    marginBottom: 8,
  },
  cardAmount: {
    color: "#0f172a",
    fontSize: 32,
    fontWeight: "700",
  },
  spacer: {
    flex: 1,
  },
  addButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
});

export default TourDemo;
