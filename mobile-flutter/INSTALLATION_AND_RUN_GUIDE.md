# 📱 Shohnaat Logistics Mobile App — APK Build & Testing Guide

> Comprehensive guide for building, downloading, and testing the **Shohnaat Logistics Android Release APK** and testing across physical devices.

---

## 🚀 2 Ways to Build & Get the Release APK

### 🥇 Method 1: Automated Cloud Build via GitHub Actions (Recommended — Zero Local Setup)
We have configured an automated GitHub Actions CI/CD workflow (`.github/workflows/build-flutter-apk.yml`) that compiles the standalone production APK in the cloud using official Ubuntu runners with Flutter, Java 17, and Android SDK.

1. **Commit & Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat(mobile): configure android release build & github actions"
   git push origin main
   ```
2. **Download APK from GitHub:**
   - Go to your repository on GitHub ➔ Click on the **Actions** tab.
   - Click on the latest workflow run: **"Build Shohnaat Mobile Android APK"**.
   - Under **Artifacts**, click **`Shohnaat-Logistics-Android-APK`** to download the compiled `.apk` zip.
   - Extract the `.apk` file and install on any Android phone!

---

### 🥈 Method 2: Local Windows Build (Using Flutter SDK)
If you want to build the APK directly on your local Windows PC:

1. **1-Click Prerequisites Setup:**
   Open PowerShell in `mobile-flutter/` directory and run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File install_flutter_windows.ps1
   ```
   *(This automatically installs Java 17 OpenJDK, downloads Flutter SDK to `C:\src\flutter`, and sets up environment variables).*

2. **1-Click APK Build:**
   Double click on `mobile-flutter/build_apk.bat` or run:
   ```bash
   cd mobile-flutter
   flutter pub get
   flutter build apk --release
   ```

3. **Compiled APK Output Location:**
   ```
   mobile-flutter/build/app/outputs/flutter-apk/app-release.apk
   ```

---

## 📲 How to Install & Test on a Physical Android Phone

1. **Transfer APK to Phone:**
   - Transfer `app-release.apk` to your phone via USB cable, Google Drive, WhatsApp, or Telegram.
2. **Install APK:**
   - Tap on `app-release.apk` on your phone.
   - If prompted with *"Install unknown apps"*, tap **Allow / Settings ➔ Enable from this source**.
   - Tap **Install** ➔ **Open**.

---

## 🧪 Physical Device Testing Checklist

Test the following key user journeys on your phone:

### 🛵 1. Field Rider Flow (Test Account: `rider@shohnaat.com` / `rider123`)
- [ ] **1-Click Demo Login:** Tap the "Rider" chip on the login screen or enter credentials.
- [ ] **Runsheet Delivery List:** View active assigned delivery tasks (`GET /api/v1/riders/me/tasks`).
- [ ] **AI Route Optimization:** Tap the **"Optimize Route"** button to run TSP algorithm and view the fuel-efficient stop sequence.
- [ ] **One-Tap Phone Call & GPS:** Tap the phone icon to dial customer, or map icon to open Google Maps navigation.
- [ ] **Barcode & QR Scanner:** Tap the camera scanner icon to scan parcel tracking labels.
- [ ] **Delivery Completion (OTP & COD):** Complete delivery with customer OTP verification and cash collection confirmation.
- [ ] **Offline Sync Mode:** Turn on Airplane Mode ➔ complete a delivery ➔ turn internet back on ➔ verify automatic background sync.

### 🏢 2. Merchant Portal Flow (Test Account: `merchant@shohnaat.com` / `merchant123`)
- [ ] **Shipment Overview:** View live shipment list and statuses.
- [ ] **Book Parcel:** Create a new shipment booking with shipper/consignee details and live rate calculation.
- [ ] **Pickup Request:** Schedule warehouse pickup with date/time slots.

### 🔍 3. Public Customer Tracking
- [ ] **Live Tracking:** Enter tracking number `SHN-8429-2026` to see vertical timeline stepper and live ETA countdown.
