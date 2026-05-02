import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Stack,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { useEffect, useMemo, useRef } from "react";

import {
  createExpoRouterAdapter,
  TourFailureContext,
  TourProvider,
} from "../tour";
import { appTours } from "../tours/registry";

const AppLayout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const pathnameRef = useRef(pathname);
  const paramsRef = useRef(params);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const navigation = useMemo(
    () =>
      createExpoRouterAdapter({
        push: (href) => router.push(href as never),
        replace: (href) => router.replace(href as never),
        back: () => router.back(),
        getPathname: () => pathnameRef.current,
        getParams: () =>
          paramsRef.current as Record<
            string,
            string | number | boolean | null | undefined
          >,
      }),
    [router],
  );

  return (
    <TourProvider
      buttonColors={{ primaryBackground: "black" }}
      tours={appTours}
      navigation={navigation}
      prompt={{
        enabled: false,
        title: "Run Guided Product Tour?",
        description:
          "This testbed walks through routing, readiness, list reveal, and persistence behavior.",
        startButtonText: "Start Guided Tour",
        skipButtonText: "Skip For Now",
      }}
      storage={{
        keyPrefix: "tour-testbed",
        getItem: AsyncStorage.getItem,
        setItem: AsyncStorage.setItem,
        removeItem: AsyncStorage.removeItem,
      }}
      engine={{
        defaultReadiness: {
          timeoutMs: 12_000,
          pollIntervalMs: 75,
        },
        onFailure: (ctx: TourFailureContext) => {
          if (ctx.reason === "target_not_found") return "retry";
          if (ctx.reason === "scroll_container_not_found") return "skip";
          return "stop";
        },
      }}
      lifecycle={{
        onStart: (steps) => {
          console.log("[tour] start", {
            totalSteps: steps.length,
            stepIds: steps.map((step) => step.id ?? step.target),
          });
        },
        onStepChange: (step, index) => {
          console.log("[tour] step_change", {
            index,
            id: step.id ?? step.target,
            route: step.route ?? null,
            target: step.target,
          });
        },
        onBeforeRouteChange: (ctx) => {
          console.log("[tour] before_route_change", {
            from: ctx.from,
            to: ctx.to,
            direction: ctx.direction,
            stepId: ctx.step.id ?? ctx.step.target,
          });
        },
        onAfterRouteChange: (ctx) => {
          console.log("[tour] after_route_change", {
            from: ctx.from,
            to: ctx.to,
            direction: ctx.direction,
            stepId: ctx.step.id ?? ctx.step.target,
          });
        },
        onWaitingForReadiness: (step) => {
          console.log("[tour] waiting_for_readiness", {
            id: step.id ?? step.target,
            route: step.route ?? null,
          });
        },
        onStepFailed: (ctx) => {
          console.log("[tour] step_failed", {
            id: ctx.step.id ?? ctx.step.target,
            target: ctx.step.target,
            route: ctx.step.route ?? null,
            direction: ctx.direction,
            reason: ctx.reason,
            error: String(ctx.error),
          });
        },
        onStop: () => console.log("[tour] stop"),
        onSkip: () => console.log("[tour] skip"),
        onFinish: () => console.log("[tour] finish"),
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TourProvider>
  );
};

export default AppLayout;
