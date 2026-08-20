# 📱 Shohnaat Mobile App — Installation & Run Guide

> Complete instructions to run, test, and build the **Shohnaat Logistics Cross-Platform Mobile Application** on **Android, iOS, Chrome (Web), and Windows**.

---

## ⚡ Option 1: Instant Live Browser / Phone Preview (No Install Needed)

Since our Next.js frontend has built-in mobile PWA support, you can open and test the mobile application immediately on your phone or browser:

1. **Open on Phone Browser or Desktop:**
   - **🛵 Field Rider Portal:** [https://shohnaat.rahimbadsa.me/rider](https://shohnaat.rahimbadsa.me/rider)
   - **🏢 Merchant Portal:** [https://shohnaat.rahimbadsa.me/dashboard](https://shohnaat.rahimbadsa.me/dashboard)
   - **🛡️ Admin Operations:** [https://shohnaat.rahimbadsa.me/admin](https://shohnaat.rahimbadsa.me/admin)
   - **🔍 Public Live Tracking:** [https://shohnaat.rahimbadsa.me/track/SHN-8429-2026](https://shohnaat.rahimbadsa.me/track/SHN-8429-2026)

2. **Install as Native PWA App on Phone:**
   - In Chrome on Android: Tap `⋮` (Menu) ➔ **"Install app"** or **"Add to Home screen"**.
   - In Safari on iOS: Tap Share Icon ➔ **"Add to Home Screen"**.

---

## 🛠️ Option 2: Running the Dedicated Flutter Codebase (`mobile-flutter/`)

### Prerequisites:
1. Install **Flutter SDK** from [https://docs.flutter.dev/get-started/install/windows](https://docs.flutter.dev/get-started/install/windows)
2. Extract to `C:\src\flutter` and add `C:\src\flutter\bin` to your Windows Environment Variables `PATH`.
3. (Optional) Install **VS Code** with Flutter extension or **Android Studio**.

---

### 🚀 Running the App:

#### 1-Click Launch on Windows:
Double click on `mobile-flutter/run_app.bat`

#### Or run via Terminal:
```bash
cd mobile-flutter

# 1. Fetch dependencies
flutter pub get

# 2. Run in Chrome Browser (Instant Web Preview)
flutter run -d chrome

# 3. Run on connected Android phone or Emulator
flutter run
```

---

## 📦 Option 3: Building Standalone Android APK (`.apk`)

To generate an installable `.apk` file to install on any Android smartphone:

```bash
cd mobile-flutter

# Build release APK
flutter build apk --release
```

Your compiled APK file will be ready at:
`mobile-flutter/build/app/outputs/flutter-apk/app-release.apk`
