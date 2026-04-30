import React, { useRef, useState } from "react";
import {
  Dimensions,
  LayoutRectangle,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
  findNodeHandle,
} from "react-native";

type Placement = "top" | "bottom" | "left" | "right" | "auto";

type TourStep = {
  title: string;
  description?: string;
  placement?: Placement;
  targetRef: React.RefObject<View | null>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TOOLTIP_WIDTH = 280;
const TOOLTIP_HEIGHT = 140;
const SPACING = 12;
const SPOTLIGHT_PADDING = 8;

const measureTarget = (ref: React.RefObject<View | null>) => {
  return new Promise<LayoutRectangle>((resolve, reject) => {
    const node = findNodeHandle(ref.current);

    if (!node) {
      reject(new Error("Target ref not found"));
      return;
    }

    UIManager.measureInWindow(node, (x, y, width, height) => {
      resolve({ x, y, width, height });
    });
  });
};

const getTooltipPosition = (
  target: LayoutRectangle,
  placement: Placement = "auto",
) => {
  console.log("Target layout:", target);
  const spaceAbove = target.y;
  const spaceBelow = SCREEN_HEIGHT - (target.y + target.height);
  const spaceLeft = target.x;
  const spaceRight = SCREEN_WIDTH - (target.x + target.width);

  let finalPlacement = placement;

  if (placement === "auto") {
    if (spaceBelow >= TOOLTIP_HEIGHT + SPACING) {
      finalPlacement = "bottom";
    } else if (spaceAbove >= TOOLTIP_HEIGHT + SPACING) {
      finalPlacement = "top";
    } else if (spaceRight >= TOOLTIP_WIDTH + SPACING) {
      finalPlacement = "right";
    } else {
      finalPlacement = "left";
    }
  }

  let top = 0;
  let left = 0;

  if (finalPlacement === "bottom") {
    top = target.y + target.height + SPACING;
    left = target.x + target.width / 2 - TOOLTIP_WIDTH / 2;
  }

  if (finalPlacement === "top") {
    top = target.y - TOOLTIP_HEIGHT - SPACING;
    left = target.x + target.width / 2 - TOOLTIP_WIDTH / 2;
  }

  if (finalPlacement === "right") {
    top = target.y + target.height / 2 - TOOLTIP_HEIGHT / 2;
    left = target.x + target.width + SPACING;
  }

  if (finalPlacement === "left") {
    top = target.y + target.height / 2 - TOOLTIP_HEIGHT / 2;
    left = target.x - TOOLTIP_WIDTH - SPACING;
  }

  // Keep tooltip inside screen horizontally
  left = Math.max(16, Math.min(left, SCREEN_WIDTH - TOOLTIP_WIDTH - 16));

  // Keep tooltip inside screen vertically
  top = Math.max(40, Math.min(top, SCREEN_HEIGHT - TOOLTIP_HEIGHT - 40));

  return {
    top,
    left,
    placement: finalPlacement,
  };
};

const TourDemo = () => {
  const addButtonRef = useRef<View>(null);
  const searchRef = useRef<View>(null);
  const cardRef = useRef<View>(null);

  const [showTourPrompt, setShowTourPrompt] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(
    null,
  );

  const steps: TourStep[] = [
    {
      title: "Add a product",
      description: "Tap here to add a new product to your inventory.",
      placement: "top",
      targetRef: addButtonRef,
    },
    {
      title: "Search products",
      description: "Use this field to quickly find products.",
      placement: "bottom",
      targetRef: searchRef,
    },
    {
      title: "View sales summary",
      description: "This card shows your most important sales information.",
      placement: "bottom",
      targetRef: cardRef,
    },
  ];

  const activeStep = activeStepIndex !== null ? steps[activeStepIndex] : null;

  const startTour = async () => {
    setShowTourPrompt(false);
    await goToStep(0);
  };

  const stopTour = () => {
    setActiveStepIndex(null);
    setTargetLayout(null);
  };

  const goToStep = async (index: number) => {
    const step = steps[index];

    if (!step) return;

    try {
      const layout = await measureTarget(step.targetRef);

      setTargetLayout(layout);
      setActiveStepIndex(index);
    } catch (error) {
      console.warn("Could not measure target:", error);
    }
  };

  const nextStep = async () => {
    if (activeStepIndex === null) return;

    const nextIndex = activeStepIndex + 1;

    if (nextIndex >= steps.length) {
      stopTour();
      return;
    }

    await goToStep(nextIndex);
  };

  const previousStep = async () => {
    if (activeStepIndex === null) return;

    const previousIndex = activeStepIndex - 1;

    if (previousIndex < 0) return;

    await goToStep(previousIndex);
  };

  const tooltipPosition =
    activeStep && targetLayout
      ? getTooltipPosition(targetLayout, activeStep.placement)
      : null;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Inventory Dashboard</Text>

      <View
        ref={searchRef}
        collapsable={false}
        style={styles.searchBox}
      >
        <Text style={styles.searchText}>Search products...</Text>
      </View>

      <View
        ref={cardRef}
        collapsable={false}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Today’s Sales</Text>
        <Text style={styles.cardAmount}>₦245,000</Text>
      </View>

      <View style={styles.spacer} />

      <View
        ref={addButtonRef}
        collapsable={false}
      >
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Product</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.startButton}
        onPress={() => setShowTourPrompt(true)}
      >
        <Text style={styles.startButtonText}>Start Tour</Text>
      </Pressable>

      {showTourPrompt && activeStepIndex === null && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={styles.overlay} />
          <View style={styles.tourPromptCard}>
            <Text style={styles.tourPromptTitle}>
              Take a quick product tour?
            </Text>
            <Text style={styles.tourPromptDescription}>
              You can skip now and start it again later anytime.
            </Text>
            <View style={styles.tooltipActions}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setShowTourPrompt(false)}
              >
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </Pressable>
              <Pressable
                style={styles.primaryButton}
                onPress={startTour}
              >
                <Text style={styles.primaryButtonText}>Start Tour</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {activeStep && targetLayout && tooltipPosition && (
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.overlay}
            onPress={() => {}}
          />

          <View
            pointerEvents="none"
            style={[
              styles.spotlight,
              {
                top: targetLayout.y - SPOTLIGHT_PADDING,
                left: targetLayout.x - SPOTLIGHT_PADDING,
                width: targetLayout.width + SPOTLIGHT_PADDING * 2,
                height: targetLayout.height + SPOTLIGHT_PADDING * 2,
              },
            ]}
          />

          <View
            style={[
              styles.tooltip,
              {
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              },
            ]}
          >
            <Pressable
              onPress={stopTour}
              style={styles.closeButton}
              hitSlop={8}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>

            <Text style={styles.stepCounter}>
              Step {activeStepIndex! + 1} of {steps.length}
            </Text>

            <Text style={styles.tooltipTitle}>{activeStep.title}</Text>

            {activeStep.description ? (
              <Text style={styles.tooltipDescription}>
                {activeStep.description}
              </Text>
            ) : null}

            <View style={styles.tooltipActions}>
              <Pressable
                onPress={previousStep}
                disabled={activeStepIndex === 0}
                style={[
                  styles.secondaryButton,
                  activeStepIndex === 0 && styles.disabledButton,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>

              <Pressable
                onPress={nextStep}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {activeStepIndex === steps.length - 1 ? "Done" : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
    marginBottom: 20,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  spotlight: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tooltip: {
    position: "absolute",
    width: TOOLTIP_WIDTH,
    minHeight: TOOLTIP_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  closeButtonText: {
    fontSize: 18,
    lineHeight: 20,
    color: "#334155",
    fontWeight: "700",
  },
  stepCounter: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    paddingRight: 32,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  tooltipDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    marginBottom: 16,
  },
  tourPromptCard: {
    marginTop: "auto",
    marginBottom: "auto",
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
  },
  tourPromptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  tourPromptDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    marginBottom: 16,
  },
  tooltipActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.4,
  },
});

export default TourDemo;
