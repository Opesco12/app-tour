import React, {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutRectangle, Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_OVERLAY_OPACITY,
  DEFAULT_SPOTLIGHT_PADDING,
  DEFAULT_SPOTLIGHT_RADIUS,
  DEFAULT_TOOLTIP_BACKGROUND,
  DEFAULT_TOOLTIP_TEXT_COLOR,
} from "./constants";
import { DefaultTourTooltip } from "./DefaultTourTooltip";
import { buildSpotlightPath, getScreenSize, getTooltipPosition } from "./geometry";
import { TourPrompt } from "./TourPrompt";
import {
  SpotlightShape,
  TourButtonColors,
  TourLifecycle,
  TourStep,
  TourTooltipRenderProps,
  TourTooltipRenderer,
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
  onStart?: TourLifecycle["onStart"];
  onStepChange?: TourLifecycle["onStepChange"];
  onFinish?: TourLifecycle["onFinish"];
  onSkip?: TourLifecycle["onSkip"];
  onStop?: TourLifecycle["onStop"];
};

const DEFAULT_BUTTON_COLORS: Required<TourButtonColors> = {
  primaryBackground: "#2563eb",
  primaryText: "#fff",
  secondaryBackground: "#e2e8f0",
  secondaryText: "#0f172a",
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

export const TourProvider = ({
  children,
  renderTooltip,
  buttonColors,
  spotlightShape = "rounded-rectangle",
  spotlightBorderRadius = DEFAULT_SPOTLIGHT_RADIUS,
  spotlightPadding = DEFAULT_SPOTLIGHT_PADDING,
  overlayOpacity = DEFAULT_OVERLAY_OPACITY,
  overlayColor,
  closeOnOverlayPress = false,
  tooltipBackground = DEFAULT_TOOLTIP_BACKGROUND,
  tooltipTextColor = DEFAULT_TOOLTIP_TEXT_COLOR,
  onStart,
  onStepChange,
  onFinish,
  onSkip,
  onStop,
}: TourProviderProps) => {
  const { width: screenWidth, height: screenHeight } = getScreenSize();
  const targetsRef = useRef<Map<string, RefObject<View | null>>>(new Map());

  const resolvedButtonColors = { ...DEFAULT_BUTTON_COLORS, ...buttonColors };
  const safeSpotlightPadding = Math.max(0, spotlightPadding);
  const clampedOverlayOpacity = Math.max(0, Math.min(overlayOpacity, 1));
  const resolvedOverlayColor =
    overlayColor ?? `rgba(0,0,0,${clampedOverlayOpacity})`;

  const [showPrompt, setShowPrompt] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(null);

  const registerTarget = useCallback((id: string, ref: RefObject<View | null>) => {
    targetsRef.current.set(id, ref);
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    targetsRef.current.delete(id);
  }, []);

  const stopTour = useCallback(
    (reason: "stop" | "skip" | "finish" | "internal" = "stop") => {
      if (reason === "finish") onFinish?.();
      if (reason === "skip") onSkip?.();
      if (reason === "stop") onStop?.();

      setActiveStepIndex(null);
      setTargetLayout(null);
      setSteps([]);
      setShowPrompt(false);
    },
    [onFinish, onSkip, onStop],
  );

  const goToStep = useCallback(
    async (index: number) => {
      const step = steps[index];
      if (!step) {
        stopTour("internal");
        return;
      }

      const targetRef = targetsRef.current.get(step.target);
      if (!targetRef) {
        console.warn(`[Tour] target not registered: ${step.target}`);
        stopTour("internal");
        return;
      }

      try {
        const layout = await measureTarget(targetRef);
        setTargetLayout(layout);
        setActiveStepIndex(index);
        onStepChange?.(step, index);
      } catch (error) {
        console.warn("[Tour] Could not measure target:", error);
        stopTour("internal");
      }
    },
    [onStepChange, steps, stopTour],
  );

  const beginTour = useCallback(async () => {
    onStart?.(steps);
    setShowPrompt(false);
    await goToStep(0);
  }, [goToStep, onStart, steps]);

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
      stopTour("finish");
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

  const spotlightPath = buildSpotlightPath({
    shape: spotlightShape,
    left: normalizedLeft,
    top: normalizedTop,
    width: normalizedWidth,
    height: normalizedHeight,
    borderRadius: spotlightBorderRadius,
  });

  const overlayPath = `M 0 0 H ${screenWidth} V ${screenHeight} H 0 Z ${spotlightPath}`;
  const spotlightRight = normalizedLeft + normalizedWidth;
  const spotlightBottom = normalizedTop + normalizedHeight;

  const allowInteractionWithTarget = Boolean(activeStep?.allowInteractionWithTarget);
  const handleOverlayPress = () => {
    if (closeOnOverlayPress) stopTour("stop");
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
          stop: () => stopTour("stop"),
        }
      : null;

  const contextValue = useMemo(
    () => ({ registerTarget, unregisterTarget, startTour, stopTour: () => stopTour("stop") }),
    [registerTarget, startTour, stopTour, unregisterTarget],
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}

      {showPrompt && activeStepIndex === null && (
        <TourPrompt
          overlayColor={resolvedOverlayColor}
          buttonColors={resolvedButtonColors}
          onSkip={() => stopTour("skip")}
          onStart={beginTour}
        />
      )}

      {activeStep && targetLayout && tooltipPosition && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {allowInteractionWithTarget ? (
            <>
              <Pressable
                style={[styles.overlayTouchSegment, { top: 0, left: 0, right: 0, height: normalizedTop }]}
                onPress={handleOverlayPress}
              />
              <Pressable
                style={[styles.overlayTouchSegment, { top: spotlightBottom, left: 0, right: 0, bottom: 0 }]}
                onPress={handleOverlayPress}
              />
              <Pressable
                style={[
                  styles.overlayTouchSegment,
                  { top: normalizedTop, left: 0, width: normalizedLeft, height: normalizedHeight },
                ]}
                onPress={handleOverlayPress}
              />
              <Pressable
                style={[
                  styles.overlayTouchSegment,
                  { top: normalizedTop, left: spotlightRight, right: 0, height: normalizedHeight },
                ]}
                onPress={handleOverlayPress}
              />
            </>
          ) : (
            <Pressable style={StyleSheet.absoluteFill} onPress={handleOverlayPress} />
          )}

          <Svg pointerEvents="none" width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFill}>
            <Path d={overlayPath} fill={resolvedOverlayColor} fillRule="evenodd" />
          </Svg>

          <Svg pointerEvents="none" width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFill}>
            <Path d={spotlightPath} fill="none" stroke="#fff" strokeWidth={2} />
          </Svg>

          {renderTooltip && tooltipRenderProps ? (
            renderTooltip(tooltipRenderProps)
          ) : (
            <DefaultTourTooltip
              step={activeStep}
              stepIndex={activeStepIndex!}
              totalSteps={steps.length}
              position={tooltipPosition}
              tooltipBackground={tooltipBackground}
              tooltipTextColor={tooltipTextColor}
              buttonColors={resolvedButtonColors}
              onClose={() => stopTour("stop")}
              onBack={previousStep}
              onNext={nextStep}
            />
          )}
        </View>
      )}
    </TourContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlayTouchSegment: {
    position: "absolute",
  },
});
