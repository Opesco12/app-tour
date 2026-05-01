import React, {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  LayoutRectangle,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  Placement,
  SpotlightShape,
  TourButtonColors,
  TourStep,
  TourTooltipRenderer,
  TourTooltipRenderProps,
} from "./types";

type TourContextValue = {
  registerTarget: (id: string, ref: RefObject<View | null>) => void;
  unregisterTarget: (id: string) => void;
  startTour: (steps: TourStep[]) => void;
  stopTour: () => void;
};

export const TourContext = createContext<TourContextValue | null>(null);

type TourProviderProps = {
  children: ReactNode;
  renderTooltip?: TourTooltipRenderer;
  buttonColors?: TourButtonColors;
  spotlightShape?: SpotlightShape;
  spotlightBorderRadius?: number;
  spotlightPadding?: number;
  overlayOpacity?: number;
  overlayColor?: string;
  closeOnOverlayPress?: boolean;
  tooltipBackground?: string;
  tooltipTextColor?: string;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TOOLTIP_WIDTH = 280;
const TOOLTIP_HEIGHT = 140;
const SPACING = 12;
const SPOTLIGHT_PADDING = 8;
const SPOTLIGHT_RADIUS = 12;
const DEFAULT_OVERLAY_OPACITY = 0.65;
const DEFAULT_TOOLTIP_BACKGROUND = "#fff";
const DEFAULT_TOOLTIP_TEXT_COLOR = "#0f172a";
const DEFAULT_BUTTON_COLORS: Required<TourButtonColors> = {
  primaryBackground: "#2563eb",
  primaryText: "#fff",
  secondaryBackground: "#e2e8f0",
  secondaryText: "#0f172a",
};

const roundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  return [
    `M ${x + r} ${y}`,
    `H ${x + width - r}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `V ${y + height - r}`,
    `Q ${x + width} ${y + height} ${x + width - r} ${y + height}`,
    `H ${x + r}`,
    `Q ${x} ${y + height} ${x} ${y + height - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    "Z",
  ].join(" ");
};

const ellipsePath = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
) => {
  const rx = Math.max(0, radiusX);
  const ry = Math.max(0, radiusY);
  return [
    `M ${centerX - rx} ${centerY}`,
    `A ${rx} ${ry} 0 1 0 ${centerX + rx} ${centerY}`,
    `A ${rx} ${ry} 0 1 0 ${centerX - rx} ${centerY}`,
    "Z",
  ].join(" ");
};

const measureTarget = (ref: RefObject<View | null>) => {
  return new Promise<LayoutRectangle>((resolve, reject) => {
    if (!ref.current) {
      reject(new Error("Target ref not found"));
      return;
    }

    ref.current.measureInWindow((x, y, width, height) => {
      resolve({ x, y, width, height });
    });
  });
};

const getTooltipPosition = (
  target: LayoutRectangle,
  placement: Placement = "auto",
) => {
  const spaceAbove = target.y;
  const spaceBelow = SCREEN_HEIGHT - (target.y + target.height);
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

  left = Math.max(16, Math.min(left, SCREEN_WIDTH - TOOLTIP_WIDTH - 16));
  top = Math.max(40, Math.min(top, SCREEN_HEIGHT - TOOLTIP_HEIGHT - 40));

  return {
    top,
    left,
    placement: finalPlacement,
  };
};

export const TourProvider = ({
  children,
  renderTooltip,
  buttonColors,
  spotlightShape = "rounded-rectangle",
  spotlightBorderRadius = SPOTLIGHT_RADIUS,
  spotlightPadding = SPOTLIGHT_PADDING,
  overlayOpacity = DEFAULT_OVERLAY_OPACITY,
  overlayColor,
  closeOnOverlayPress = false,
  tooltipBackground = DEFAULT_TOOLTIP_BACKGROUND,
  tooltipTextColor = DEFAULT_TOOLTIP_TEXT_COLOR,
}: TourProviderProps) => {
  const targetsRef = useRef<Map<string, RefObject<View | null>>>(new Map());
  const resolvedButtonColors = { ...DEFAULT_BUTTON_COLORS, ...buttonColors };
  const safeSpotlightPadding = Math.max(0, spotlightPadding);
  const clampedOverlayOpacity = Math.max(0, Math.min(overlayOpacity, 1));
  const resolvedOverlayColor =
    overlayColor ?? `rgba(0,0,0,${clampedOverlayOpacity})`;

  const [showPrompt, setShowPrompt] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(
    null,
  );

  const registerTarget = useCallback(
    (id: string, ref: RefObject<View | null>) => {
      targetsRef.current.set(id, ref);
    },
    [],
  );

  const unregisterTarget = useCallback((id: string) => {
    targetsRef.current.delete(id);
  }, []);

  const stopTour = useCallback(() => {
    setActiveStepIndex(null);
    setTargetLayout(null);
    setSteps([]);
    setShowPrompt(false);
  }, []);

  const goToStep = useCallback(
    async (index: number) => {
      const step = steps[index];

      if (!step) {
        stopTour();
        return;
      }

      const targetRef = targetsRef.current.get(step.target);

      if (!targetRef) {
        console.warn(`[Tour] target not registered: ${step.target}`);
        stopTour();
        return;
      }

      try {
        const layout = await measureTarget(targetRef);
        setTargetLayout(layout);
        setActiveStepIndex(index);
      } catch (error) {
        console.warn("[Tour] Could not measure target:", error);
        stopTour();
      }
    },
    [steps, stopTour],
  );

  const beginTour = useCallback(async () => {
    setShowPrompt(false);
    await goToStep(0);
  }, [goToStep]);

  const startTour = useCallback((newSteps: TourStep[]) => {
    if (!newSteps.length) return;

    setSteps(newSteps);
    setShowPrompt(true);
    setActiveStepIndex(null);
    setTargetLayout(null);
  }, []);

  const nextStep = useCallback(async () => {
    if (activeStepIndex === null) return;

    const nextIndex = activeStepIndex + 1;

    if (nextIndex >= steps.length) {
      stopTour();
      return;
    }

    await goToStep(nextIndex);
  }, [activeStepIndex, goToStep, steps.length, stopTour]);

  const previousStep = useCallback(async () => {
    if (activeStepIndex === null) return;

    const previousIndex = activeStepIndex - 1;

    if (previousIndex < 0) return;

    await goToStep(previousIndex);
  }, [activeStepIndex, goToStep]);

  const activeStep =
    activeStepIndex !== null && steps[activeStepIndex]
      ? steps[activeStepIndex]
      : null;

  const tooltipPosition =
    activeStep && targetLayout
      ? getTooltipPosition(targetLayout, activeStep.placement)
      : null;

  const spotlightTop =
    targetLayout !== null ? targetLayout.y - safeSpotlightPadding : 0;
  const spotlightLeft =
    targetLayout !== null ? targetLayout.x - safeSpotlightPadding : 0;
  const spotlightWidth =
    targetLayout !== null ? targetLayout.width + safeSpotlightPadding * 2 : 0;
  const spotlightHeight =
    targetLayout !== null ? targetLayout.height + safeSpotlightPadding * 2 : 0;
  const normalizedLeft = Math.max(0, spotlightLeft);
  const normalizedTop = Math.max(0, spotlightTop);
  const normalizedWidth = Math.max(0, spotlightWidth);
  const normalizedHeight = Math.max(0, spotlightHeight);
  const spotlightCutoutPath =
    spotlightShape === "circle"
      ? ellipsePath(
          normalizedLeft + normalizedWidth / 2,
          normalizedTop + normalizedHeight / 2,
          Math.min(normalizedWidth, normalizedHeight) / 2,
          Math.min(normalizedWidth, normalizedHeight) / 2,
        )
      : spotlightShape === "oval"
        ? ellipsePath(
            normalizedLeft + normalizedWidth / 2,
            normalizedTop + normalizedHeight / 2,
            normalizedWidth / 2,
            normalizedHeight / 2,
          )
        : spotlightShape === "rectangle"
          ? roundedRectPath(
              normalizedLeft,
              normalizedTop,
              normalizedWidth,
              normalizedHeight,
              0,
            )
          : roundedRectPath(
              normalizedLeft,
              normalizedTop,
              normalizedWidth,
              normalizedHeight,
              spotlightBorderRadius,
            );
  const overlayPath = `M 0 0 H ${SCREEN_WIDTH} V ${SCREEN_HEIGHT} H 0 Z ${spotlightCutoutPath}`;
  const spotlightRight = normalizedLeft + normalizedWidth;
  const spotlightBottom = normalizedTop + normalizedHeight;
  const allowInteractionWithTarget = Boolean(activeStep?.allowInteractionWithTarget);
  const handleOverlayPress = () => {
    if (closeOnOverlayPress) {
      stopTour();
    }
  };
  const tooltipRenderProps: TourTooltipRenderProps | null =
    activeStep && activeStepIndex !== null && tooltipPosition
      ? {
          step: activeStep,
          stepIndex: activeStepIndex,
          totalSteps: steps.length,
          isFirstStep: activeStepIndex === 0,
          isLastStep: activeStepIndex === steps.length - 1,
          position: tooltipPosition,
          next: nextStep,
          back: previousStep,
          stop: stopTour,
        }
      : null;

  const contextValue = useMemo(
    () => ({
      registerTarget,
      unregisterTarget,
      startTour,
      stopTour,
    }),
    [registerTarget, startTour, stopTour, unregisterTarget],
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}

      {showPrompt && activeStepIndex === null && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={[styles.overlay, { backgroundColor: resolvedOverlayColor }]}
          />
          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Take a quick product tour?</Text>
            <Text style={styles.promptDescription}>
              You can skip now and start it again later anytime.
            </Text>
            <View style={styles.actionsRow}>
              <Pressable
                style={[
                  styles.secondaryButton,
                  { backgroundColor: resolvedButtonColors.secondaryBackground },
                ]}
                onPress={stopTour}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: resolvedButtonColors.secondaryText },
                  ]}
                >
                  Skip
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.primaryButton,
                  { backgroundColor: resolvedButtonColors.primaryBackground },
                ]}
                onPress={beginTour}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: resolvedButtonColors.primaryText },
                  ]}
                >
                  Start Tour
                </Text>
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
          {allowInteractionWithTarget ? (
            <>
              <Pressable
                style={[
                  styles.overlayTouchSegment,
                  {
                    top: 0,
                    left: 0,
                    right: 0,
                    height: normalizedTop,
                  },
                ]}
                onPress={handleOverlayPress}
              />
              <Pressable
                style={[
                  styles.overlayTouchSegment,
                  {
                    top: spotlightBottom,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  },
                ]}
                onPress={handleOverlayPress}
              />
              <Pressable
                style={[
                  styles.overlayTouchSegment,
                  {
                    top: normalizedTop,
                    left: 0,
                    width: normalizedLeft,
                    height: normalizedHeight,
                  },
                ]}
                onPress={handleOverlayPress}
              />
              <Pressable
                style={[
                  styles.overlayTouchSegment,
                  {
                    top: normalizedTop,
                    left: spotlightRight,
                    right: 0,
                    height: normalizedHeight,
                  },
                ]}
                onPress={handleOverlayPress}
              />
            </>
          ) : (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleOverlayPress}
            />
          )}

          <Svg
            pointerEvents="none"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            style={StyleSheet.absoluteFill}
          >
            <Path
              d={overlayPath}
              fill={resolvedOverlayColor}
              fillRule="evenodd"
            />
          </Svg>

          <Svg
            pointerEvents="none"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            style={StyleSheet.absoluteFill}
          >
            <Path
              d={spotlightCutoutPath}
              fill="none"
              stroke="#fff"
              strokeWidth={2}
            />
          </Svg>

          {renderTooltip && tooltipRenderProps ? (
            renderTooltip(tooltipRenderProps)
          ) : (
            <View
              style={[
                styles.tooltip,
                {
                  top: tooltipPosition.top,
                  left: tooltipPosition.left,
                  backgroundColor: tooltipBackground,
                },
              ]}
            >
              <Pressable
                onPress={stopTour}
                style={styles.closeButton}
                hitSlop={8}
              >
                <Text style={[styles.closeButtonText, { color: tooltipTextColor }]}>
                  ×
                </Text>
              </Pressable>

              <Text style={[styles.stepCounter, { color: tooltipTextColor, opacity: 0.7 }]}>
                Step {activeStepIndex! + 1} of {steps.length}
              </Text>

              <Text style={[styles.tooltipTitle, { color: tooltipTextColor }]}>
                {activeStep.title}
              </Text>

              {activeStep.description ? (
                <Text style={[styles.tooltipDescription, { color: tooltipTextColor, opacity: 0.85 }]}>
                  {activeStep.description}
                </Text>
              ) : null}

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={previousStep}
                  disabled={activeStepIndex === 0}
                  style={[
                    styles.secondaryButton,
                    {
                      backgroundColor: resolvedButtonColors.secondaryBackground,
                    },
                    activeStepIndex === 0 && styles.disabledButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      { color: resolvedButtonColors.secondaryText },
                    ]}
                  >
                    Back
                  </Text>
                </Pressable>

                <Pressable
                  onPress={nextStep}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: resolvedButtonColors.primaryBackground },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: resolvedButtonColors.primaryText },
                    ]}
                  >
                    {activeStepIndex === steps.length - 1 ? "Done" : "Next"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </TourContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  overlayTouchSegment: {
    position: "absolute",
  },
  promptCard: {
    marginTop: "auto",
    marginBottom: "auto",
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 20,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  promptDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    marginBottom: 16,
  },
  tooltip: {
    position: "absolute",
    width: TOOLTIP_WIDTH,
    minHeight: TOOLTIP_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 12,
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
  actionsRow: {
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
