import React, { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { FlatList, FlatListProps, View } from "react-native";

import { TourStep } from "./types";
import { useTour } from "./useTour";

type TourFlatListProps<ItemT> = PropsWithChildren<
  FlatListProps<ItemT> & {
    id: string;
    revealSettleMs?: number;
    getTourTargetId?: (item: ItemT, index: number) => string;
  }
>;

const delay = (ms: number, signal: AbortSignal) => {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("aborted"));
    };
    if (signal.aborted) {
      clearTimeout(timer);
      reject(new Error("aborted"));
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
};

const findIndexByTarget = <ItemT,>(
  step: TourStep,
  data: readonly ItemT[] | null | undefined,
  getTourTargetId?: (item: ItemT, index: number) => string,
) => {
  if (typeof step.scrollTargetIndex === "number") return step.scrollTargetIndex;
  if (!data || !getTourTargetId) return -1;
  return data.findIndex((item, index) => getTourTargetId(item, index) === step.target);
};

export const TourFlatList = <ItemT,>({
  id,
  revealSettleMs = 300,
  getTourTargetId,
  data,
  ...rest
}: TourFlatListProps<ItemT>) => {
  const { registerScrollContainer, unregisterScrollContainer } = useTour();
  const listRef = useRef<FlatList<ItemT>>(null);
  const containerRef = useRef<View>(null);

  const stableData = useMemo<readonly ItemT[]>(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : Array.from(data);
  }, [data]);

  useEffect(() => {
    registerScrollContainer(id, {
      revealTarget: async (step, _targetRef, signal) => {
        const list = listRef.current;
        const container = containerRef.current;
        if (!list || !container) throw new Error("scroll_container_not_found");

        const index = findIndexByTarget(step, stableData, getTourTargetId);
        if (index < 0) return;

        list.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        await delay(revealSettleMs, signal);
      },
    });

    return () => unregisterScrollContainer(id);
  }, [
    getTourTargetId,
    id,
    registerScrollContainer,
    revealSettleMs,
    stableData,
    unregisterScrollContainer,
  ]);

  return (
    <View ref={containerRef} collapsable={false} style={{ flex: 1 }}>
      <FlatList ref={listRef} data={data} {...rest} />
    </View>
  );
};
