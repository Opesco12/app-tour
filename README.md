# React Native Tour System (Expo Router Testbed)

A production-oriented guided tour system for React Native apps using Expo Router.

This project includes both:

- A reusable tour engine (`src/tour`) with routing, list scrolling, readiness, and persistence support.
- A full in-app testbed (`src/app`) that exercises all features across tabs, nested stacks, and multiple list types.

## What This Supports

- Named tours via registry (`defineTours` + `tours` prop on `TourProvider`)
- Inline tours (`startTour([...])`) and named tours (`startTour("id")`)
- Prompt before tour start
- Cross-route navigation steps (Expo Router adapter)
- Navigation modes: `push`, `replace`, `back`
- Step readiness gates (`delayMs`, `isReady`, `waitFor`, timeout)
- Target registration via `TourTarget`
- Spotlight overlay + tooltip rendering
- Scroll reveal support for:
  - `ScrollView` (`TourScrollView`)
  - `FlatList` (`TourFlatList`)
  - `SectionList` (`TourSectionList`)
- Upward and downward off-screen reveal correction for lists
- Lifecycle hooks and failure callbacks
- Failure strategies (`stop`, `skip`, `retry`)
- Pluggable storage adapter (AsyncStorage, MMKV wrapper, custom storage, etc.)
- Seen-state helpers (`isTourSeen`, `markTourSeen`, `clearTourSeen`)

## Project Structure

```txt
src/
  app/
    _layout.tsx                  # root stack + TourProvider
    (tabs)/
      _layout.tsx                # tab navigation + icons
      index.tsx                  # home + all-features controls
      flat.tsx                   # FlatList test screen
      section.tsx                # SectionList test screen
      lab/
        _layout.tsx              # nested stack inside tab
        index.tsx
        details.tsx              # readiness-gated step target
      settings/
        _layout.tsx              # nested stack inside tab
        index.tsx
        advanced.tsx
  tour/
    TourContext.tsx              # core engine/provider
    TourTarget.tsx               # target registration
    TourScrollView.tsx           # ScrollView reveal container
    TourFlatList.tsx             # FlatList reveal container
    TourSectionList.tsx          # SectionList reveal container
    expoRouterAdapter.ts         # router adapter
    defineTours.ts               # typed helper
    types.ts
  tours/
    registry.ts                  # named tours used by testbed
  shared/
    tourReadiness.ts             # example readiness state for lab screen
```

## Installation

Use your existing React Native / Expo app dependencies, then include the tour files.

For this testbed, required package additions include:

- `expo-router`
- `react-native-svg`
- `@react-native-async-storage/async-storage` (optional, for persistence)

## Quick Start

### 1) Wrap your app with `TourProvider`

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Stack,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { useEffect, useMemo, useRef } from "react";

import { createExpoRouterAdapter, TourProvider } from "../tour";
import { appTours } from "../tours/registry";

export default function RootLayout() {
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
      tours={appTours}
      navigation={navigation}
      storage={{
        keyPrefix: "tour",
        getItem: AsyncStorage.getItem,
        setItem: AsyncStorage.setItem,
        removeItem: AsyncStorage.removeItem,
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </TourProvider>
  );
}
```

### 2) Register target elements

```tsx
import { TourTarget } from "../tour";

<TourTarget id="home.startButton">
  <Pressable>
    <Text>Start Tour</Text>
  </Pressable>
</TourTarget>;
```

### 3) Start a tour

```tsx
import { useTour } from "../tour";

const { startTour } = useTour();

startTour("all-features");
// or inline
startTour([{ target: "home.startButton", title: "Welcome", route: "/" }]);
```

## Named Tours with `defineTours`

Use `defineTours` for clear type inference without manually typing registry shapes:

```tsx
import { defineTours } from "../tour";

export const appTours = defineTours({
  onboarding: [
    { id: "intro", target: "home.startButton", title: "Welcome", route: "/" },
  ],
  dashboard: [
    { id: "metrics", target: "home.statsCard", title: "Metrics", route: "/" },
  ],
});
```

Then pass into provider:

```tsx
<TourProvider tours={appTours}>...</TourProvider>
```

## Scroll Container Support

### ScrollView

```tsx
import { TourScrollView } from "../tour";

<TourScrollView id="settings-scroll">
  {/* content with TourTarget children */}
</TourScrollView>;
```

Step:

```ts
{
  target: "settings.notifications",
  route: "/settings",
  scrollToTarget: true,
  scrollContainerId: "settings-scroll",
}
```

### FlatList

```tsx
import { TourFlatList } from "../tour";

<TourFlatList
  id="flat-container"
  data={data}
  keyExtractor={(item) => item.id}
  getTourTargetId={(item) => item.id}
  renderItem={...}
/>
```

### SectionList

```tsx
import { TourSectionList } from "../tour";

<TourSectionList
  id="section-container"
  sections={sections}
  keyExtractor={(item) => item.id}
  getTourTargetId={(item) => item.id}
  renderItem={...}
/>
```

## Readiness and Async Screens

Use readiness when step visibility depends on async state, not just mount timing:

```ts
{
  target: "lab.details.cta",
  route: "/lab/details",
  readiness: {
    timeoutMs: 10000,
    isReady: () => getTourReady("lab.details.ready"),
  },
}
```

Tip:

- If readiness is purely visual (target appears when ready), prefer target registration flow.
- Use `isReady` or `waitFor` for non-visual async gates.

## Storage and Seen State

Storage is adapter-based and backend-agnostic:

```tsx
<TourProvider
  storage={{
    keyPrefix: "tour",
    getItem,
    setItem,
    removeItem,
  }}
>
```

Current persisted keys per named tour:

- `<prefix>:seen:<tourId>`
- `<prefix>:last-step-index:<tourId>`

Controller helpers:

```ts
const { isTourSeen, markTourSeen, clearTourSeen } = useTour();
```

### Backend sync example

If backend says user already completed onboarding on another device:

```ts
if (user.hasCompletedOnboarding) {
  await markTourSeen("onboarding");
}
```

## Controller API

From `useTour()`:

- `startTour(stepsOrTourId, options?)`
- `stopTour()`
- `nextStep()`
- `previousStep()`
- `goToStep(idOrIndex)`
- `hasTour(id)`
- `getTour(id)`
- `isTourSeen(id)`
- `markTourSeen(id)`
- `clearTourSeen(id)`
- `getState()`

`startTour` options:

- `startAtStepId`
- `startAtIndex`
- `suppressPrompt`

## Step Fields

Main fields on `TourStep`:

- `id`, `target`, `title`, `description`, `placement`
- `route`, `navigationMode`, `allowBackNavigation`
- `readiness` (`delayMs`, `isReady`, `waitFor`, `timeoutMs`, `pollIntervalMs`)
- `allowInteractionWithTarget`
- `scrollToTarget`, `scrollContainerId`
- `scrollTargetIndex`, `scrollSectionIndex` (optional explicit index hints)

## Lifecycle Hooks

Provider lifecycle options include:

- `onStart`
- `onStepChange`
- `onFinish`
- `onSkip`
- `onStop`
- `onBeforeRouteChange`
- `onAfterRouteChange`
- `onWaitingForReadiness`
- `onStepFailed`

## Failure Handling

Configure in `engine`:

```tsx
<TourProvider
  engine={{
    onFailure: (ctx) => {
      if (ctx.reason === "target_not_found") return "retry";
      if (ctx.reason === "scroll_container_not_found") return "skip";
      return "stop";
    },
  }}
>
```

Failure reasons include:

- `target_not_found`
- `scroll_container_not_found`
- `route_navigation_failed`
- `route_mismatch`
- `readiness_timeout`
- `readiness_rejected`
- `aborted`

## Testbed Routes You Can Use

- Home tab: `/`
- FlatList tab: `/flat`
- SectionList tab: `/section`
- Nested Lab stack:
  - `/lab`
  - `/lab/details`
- Nested Settings stack:
  - `/settings`
  - `/settings/advanced`

Suggested tours to run:

- `all-features`
- `quick-check`
- `flatlist-only`
- `sectionlist-only`
- `nested-lab`
- `settings-only`

## Run

```bash
npm install
npm run start
```

Lint:

```bash
npm run lint
```

## Notes

- Current lint output includes pre-existing hook dependency warnings in `TourContext.tsx` (not runtime blockers).
- The testbed intentionally includes verbose lifecycle logs to make engine behavior easy to inspect.
