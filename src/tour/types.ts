import { ReactNode } from "react";
import { LayoutRectangle } from "react-native";

export type Placement = "top" | "bottom" | "left" | "right" | "auto";

export type TourStep = {
  target: string;
  title: string;
  description?: string;
  placement?: Placement;
};

export type TourTargetHandle = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

export type TooltipPosition = {
  top: number;
  left: number;
  placement: Placement;
};

export type TargetLayout = LayoutRectangle;

export type TourTooltipRenderProps = {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  position: TooltipPosition;
  next: () => void;
  back: () => void;
  stop: () => void;
};

export type TourTooltipRenderer = (
  props: TourTooltipRenderProps,
) => ReactNode;

export type TourButtonColors = {
  primaryBackground?: string;
  primaryText?: string;
  secondaryBackground?: string;
  secondaryText?: string;
};
