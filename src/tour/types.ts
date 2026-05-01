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
