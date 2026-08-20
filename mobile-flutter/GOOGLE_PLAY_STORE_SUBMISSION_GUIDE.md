# 🚀 Shohnaat Logistics — Google Play Store Submission & Approval Master Guide

> Official checklist and step-by-step instructions to ensure **100% Guaranteed Approval** by Google Play Store App Reviewers (2026 Policy Compliant).

---

## 🛡️ 1. Technical Compliance Checklist (Already Completed ✅)

| Google Play Requirement | Implementation Status | Details |
|---|---|---|
| **Target SDK 34+** | ✅ Compliant | `compileSdk 34`, `targetSdk 34` configured |
| **App Bundle (.aab)** | ✅ Compliant | Automated `.aab` compilation via GitHub Actions & `build_appbundle.bat` |
| **Data Safety & Privacy Policy** | ✅ Compliant | In-app Privacy Policy dialog on Login & Home screens |
| **Account Deletion Option** | ✅ Compliant | In-app "Request Account Deletion" modal in compliance menu |
| **Secure HTTPS Only** | ✅ Compliant | `android:usesCleartextTraffic="false"` strictly enforced |
| **Android 14+ Foreground Service** | ✅ Compliant | `FOREGROUND_SERVICE_LOCATION` declared for continuous GPS navigation |
| **Crash-Proof Error Boundary** | ✅ Compliant | `runZonedGuarded` + Dio interceptor prevents unexpected crashes |
| **R8 / ProGuard Optimization** | ✅ Compliant | `proguard-rules.pro` preserves serialized DTOs & reflection |

---

## 📋 2. Google Play Console Setup Steps

### Step 1: Create App in Google Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Click **Create App**:
   - **App name:** `Shohnaat Logistics` (or `Shohnaat Courier & Delivery`)
   - **Default language:** English (United States)
   - **App or Game:** App
   - **Free or Paid:** Free

---

### Step 2: App Content & Policy Declarations (Crucial for Approval)

#### A. Privacy Policy URL:
- Enter your live privacy policy URL:
  `https://shohnaat.rahimbadsa.me/privacy` (or link to in-app policy).

#### B. App Access (Demo Credentials for Google Reviewers):
Google reviewers must be able to log in and test all screens without getting blocked:
- Select **"All or some functionality is restricted"** ➔ **Add instructions**:
  - **Account Name:** Google Reviewer (Rider)
  - **Username / Email:** `rider@shohnaat.com`
  - **Password:** `admin123`
  - **Notes:** *"This account has active delivery tasks and runsheet routes for testing OTP, COD collection, and barcode scanning."*

#### C. Data Safety Form:
- **Location:**
  - Collected: Yes (Approximate & Precise location)
  - Purpose: App functionality (Rider fleet tracking, delivery navigation, live ETA calculations).
  - Ephemeral: Yes (Used for live telemetry and routing).
- **Personal Info (Name, Email):**
  - Collected: Yes (User authentication and account management).
- **Photos & Media / Camera:**
  - Collected: Yes (Barcode waybill scanning & Proof of Delivery photos).
- **Data Deletion:**
  - Does the app provide a way for users to request data deletion? ➔ **YES** (In-app menu provides permanent account deletion request).

#### D. Location Permissions Declaration:
- Check **"Core app feature: Delivery navigation & courier runsheet tracking"**.

---

## 📦 3. How to Get the `.aab` App Bundle

### Option A: From GitHub Actions (Recommended)
1. Push any commit to `main`.
2. Go to **Actions** tab on GitHub ➔ **`Build Play Store Bundle (.aab) & Release APK`**.
3. Under **Artifacts**, download **`Shohnaat-GooglePlay-AppBundle-AAB`**.
4. Extract `app-release.aab` and upload directly to Google Play Console!

### Option B: Local Windows Build
```bash
cd mobile-flutter
build_appbundle.bat
```
Output: `mobile-flutter/build/app/outputs/bundle/release/app-release.aab`
