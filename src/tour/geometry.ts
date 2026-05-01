import { Dimensions, LayoutRectangle } from "react-native";

import {
  TOURTIP_HEIGHT,
  TOURTIP_WIDTH,
  TOOLTIP_SPACING,
} from "./constants";
import { Placement, SpotlightShape, TooltipPosition } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const getScreenSize = () => ({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });

export const roundedRectPath = (
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

export const ellipsePath = (
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

export const getTooltipPosition = (
  target: LayoutRectangle,
  placement: Placement = "auto",
): TooltipPosition => {
  const spaceAbove = target.y;
  const spaceBelow = SCREEN_HEIGHT - (target.y + target.height);
  const spaceRight = SCREEN_WIDTH - (target.x + target.width);

  let finalPlacement = placement;

  if (placement === "auto") {
    if (spaceBelow >= TOURTIP_HEIGHT + TOOLTIP_SPACING) {
      finalPlacement = "bottom";
    } else if (spaceAbove >= TOURTIP_HEIGHT + TOOLTIP_SPACING) {
      finalPlacement = "top";
    } else if (spaceRight >= TOURTIP_WIDTH + TOOLTIP_SPACING) {
      finalPlacement = "right";
    } else {
      finalPlacement = "left";
    }
  }

  let top = 0;
  let left = 0;

  if (finalPlacement === "bottom") {
    top = target.y + target.height + TOOLTIP_SPACING;
    left = target.x + target.width / 2 - TOURTIP_WIDTH / 2;
  }

  if (finalPlacement === "top") {
    top = target.y - TOURTIP_HEIGHT - TOOLTIP_SPACING;
    left = target.x + target.width / 2 - TOURTIP_WIDTH / 2;
  }

  if (finalPlacement === "right") {
    top = target.y + target.height / 2 - TOURTIP_HEIGHT / 2;
    left = target.x + target.width + TOOLTIP_SPACING;
  }

  if (finalPlacement === "left") {
    top = target.y + target.height / 2 - TOURTIP_HEIGHT / 2;
    left = target.x - TOURTIP_WIDTH - TOOLTIP_SPACING;
  }

  left = Math.max(16, Math.min(left, SCREEN_WIDTH - TOURTIP_WIDTH - 16));
  top = Math.max(40, Math.min(top, SCREEN_HEIGHT - TOURTIP_HEIGHT - 40));

  return { top, left, placement: finalPlacement };
};

export const buildSpotlightPath = (args: {
  shape: SpotlightShape;
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: number;
}) => {
  const { shape, left, top, width, height, borderRadius } = args;

  if (shape === "circle") {
    const r = Math.min(width, height) / 2;
    return ellipsePath(left + width / 2, top + height / 2, r, r);
  }

  if (shape === "oval") {
    return ellipsePath(left + width / 2, top + height / 2, width / 2, height / 2);
  }

  if (shape === "rectangle") {
    return roundedRectPath(left, top, width, height, 0);
  }

  return roundedRectPath(left, top, width, height, borderRadius);
};
