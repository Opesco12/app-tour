import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TourScrollView, TourTarget, useTour } from "../tour";

const HomeScreen = () => {
  const { startTour } = useTour();

  const handleStartTour = () => {
    startTour([
      {
        id: "home.start",
        target: "home.startButton",
        title: "Welcome",
        description:
          "Start here whenever you want a quick walkthrough of the product screens.",
        placement: "bottom",
        route: "/",
      },
      {
        id: "home.stats",
        target: "home.statsCard",
        title: "Live Snapshot",
        description:
          "This card shows current performance and status at a glance.",
        placement: "bottom",
        route: "/",
      },
      {
        id: "details.cta",
        target: "details.primaryCta",
        title: "Cross-screen Tour",
        description:
          "The tour moves to Details and waits until the action is available.",
        placement: "top",
        route: "/details",
        readiness: { timeoutMs: 8000 },
      },
      {
        id: "home.item6",
        target: "home.item.6",
        title: "Scrolled Item 6",
        description:
          "This step auto-scrolls to reveal item 6 in the dashboard list.",
        placement: "top",
        route: "/",
        scrollToTarget: true,
        scrollContainerId: "home-scroll",
      },
      {
        id: "home.item10",
        target: "home.item.10",
        title: "Scrolled Item 10",
        description:
          "This step auto-scrolls to reveal item 10 in the dashboard list.",
        placement: "top",
        route: "/",
        scrollToTarget: true,
        scrollContainerId: "home-scroll",
      },
      {
        id: "home.item14",
        target: "home.item.14",
        title: "Scrolled Item 14",
        description:
          "This step auto-scrolls to reveal item 14 in the dashboard list.",
        placement: "top",
        route: "/",
        scrollToTarget: true,
        scrollContainerId: "home-scroll",
      },
      {
        id: "profile.cta",
        target: "profile.cta",
        title: "Profile Screen",
        description: "Tours can target any screen, like this one on Profile.",
        placement: "bottom",
        route: "/profile",
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Operations Dashboard</Text>
      <Text style={styles.subheading}>
        Track inventory health across your locations.
      </Text>

      <TourTarget id="home.startButton">
        <Pressable
          style={styles.primaryButton}
          onPress={handleStartTour}
        >
          <Text style={styles.primaryButtonText}>Start Tour</Text>
        </Pressable>
      </TourTarget>

      <TourTarget id="home.statsCard">
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today</Text>
          <Text style={styles.cardValue}>124 Orders</Text>
          <Text style={styles.cardMeta}>Fulfillment rate: 97.4%</Text>
        </View>
      </TourTarget>

      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>Low Stock</Text>
          <Text style={styles.cardValue}>8 Items</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>Pending</Text>
          <Text style={styles.cardValue}>14 Requests</Text>
        </View>
      </View>

      <TourScrollView
        id="home-scroll"
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: 14 }, (_, index) => index + 1).map((item) => {
          const id = `home.item.${item}`;
          const card = (
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Warehouse Zone {item}</Text>
              <Text style={styles.listMeta}>Open tasks: {item + 2}</Text>
            </View>
          );

          if (item === 6 || item === 10 || item === 14) {
            return (
              <TourTarget
                key={id}
                id={id}
              >
                {card}
              </TourTarget>
            );
          }

          return <View key={id}>{card}</View>;
        })}

        <TourTarget id="home.quickAction">
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Create Restock Request
            </Text>
          </Pressable>
        </TourTarget>
      </TourScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 96,
    paddingHorizontal: 20,
    backgroundColor: "#f8fafc",
  },
  heading: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  subheading: {
    color: "#475569",
    fontSize: 16,
    marginBottom: 22,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 14,
  },
  cardLabel: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 8,
  },
  cardValue: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardMeta: {
    color: "#475569",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 10,
  },
  listTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  listMeta: {
    color: "#64748b",
    fontSize: 13,
  },
  secondaryButton: {
    marginTop: 6,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default HomeScreen;
