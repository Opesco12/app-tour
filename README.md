# 📝 Notes App with iOS Widget (Expo + React Native)

A minimal, high-performance notes app built with **React Native (Expo)** and extended with a native **iOS Home Screen Widget** using **SwiftUI + WidgetKit**.

This project demonstrates how to **share data between a React Native app and an iOS widget**, handle **deep linking**, and trigger **real-time widget updates**.

---

## 🚀 Features

- ✍️ Create and delete notes
- ⚡ Smooth animations using Reanimated
- 📱 Native-feeling UI with bottom sheet input
- 🧠 Persistent storage using App Group (shared with widget)
- 🧩 iOS Widget showing recent notes
- ➕ Widget button opens app and triggers "Add Note"
- 🔄 Widget refreshes automatically + manually
- 🎯 Deep linking integration

---

## 🏗️ Tech Stack

### App

- React Native (Expo)
- TypeScript
- Reanimated
- Gorhom Bottom Sheet

### Native iOS

- SwiftUI
- WidgetKit
- App Groups (shared storage)

### Bridging

- `@bacons/apple-targets` (ExtensionStorage)

---

## 🧠 How It Works

### 1. Shared Storage (App ↔ Widget)

```ts
const storage = new ExtensionStorage("group.<your-app-identifier>");
```

Notes are stored as JSON:

```ts
storage.set("notes", JSON.stringify(notes));
```

On the widget side (Swift):

```swift
let defaults = UserDefaults(suiteName: "group.<your-app-identifier>")
let json = defaults.string(forKey: "notes")
```

👉 This allows **both the app and widget to read the same data**.

---

### 2. Widget Updates

Widget updates happen in two ways:

#### Automatic

- Widget refreshes every 15 minutes via timeline

#### Manual (instant update)

Triggered from React Native:

```ts
ExtensionStorage.reloadWidget();
```

Also triggered when app goes to background:

```ts
AppState.addEventListener("change", (state) => {
  if (state === "background") {
    ExtensionStorage.reloadWidget();
  }
});
```

---

### 3. Deep Linking (Widget → App)

The widget "+" button uses:

```swift
Link(destination: URL(string: "<your-scheme>://?action=add-note")!)
```

In React Native:

```ts
Linking.addEventListener("url", ({ url }) => {
  if (url.includes("add-note")) {
    setBottomSheetOpen(true);
  }
});
```

👉 Result:

- Tapping "+" opens the app
- Bottom sheet opens automatically

---

### 4. Bottom Sheet Behavior

Controlled via state:

```ts
const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
```

Triggered by:

- FAB button
- Widget deep link

---

### 5. iOS Widget

Built with:

- `TimelineProvider`
- `SwiftUI Views`
- `UserDefaults (App Group)`

Displays:

- Latest 3 notes
- Title + preview text
- Empty state when no notes exist

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

---

### 2. Configure App Group

In Apple Developer, create:

```
group.<your-app-identifier>
```

Ensure it's added to:

- Main app target
- Widget extension target

---

### 3. Configure plugin

```js
// app.plugin.js
module.exports = (config) => ({
  type: "widget",
  bundleId: "<your.widget.bundle.id>",
  entitlements: {
    "com.apple.security.application-groups": ["group.<your-app-identifier>"],
  },
});
```

---

### 4. Configure deep linking

In `app.json`:

```json
{
  "expo": {
    "scheme": "<your-scheme>"
  }
}
```

---

### 5. Build the app

Because widgets require native code:

```bash
npx expo prebuild
```

or (recommended):

```bash
eas build -p ios
```
