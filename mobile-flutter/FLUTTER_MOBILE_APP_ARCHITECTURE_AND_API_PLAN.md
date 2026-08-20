# 📱 Shohnaat Logistics — Enterprise Flutter Mobile App Architecture & API Master Plan

> **Platform:** Cross-Platform Native Mobile Application (iOS & Android)  
> **Framework:** **Flutter 3.x (Dart 3.x)**  
> **Backend Integration:** 100% Connected to Existing **Shohnaat Node.js / Express / PostgreSQL / Redis APIs**  
> **Architecture Pattern:** **Feature-First Clean Architecture + BLoC / Riverpod State Management + Offline-First Local Database**

---

## 🎯 1. Target User Roles & Multi-Role App Modes

The Flutter application is engineered as a unified, role-adaptive native mobile client switching UI based on authenticated JWT role claims:

```
                          ┌────────────────────────┐
                          │   SHOHNAAT FLUTTER APP  │
                          └───────────┬────────────┘
                                      │ (JWT Role Check)
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  FIELD RIDER APP │        │  MERCHANT PORTAL │        │  CUSTOMER TRACK  │
│  - Runsheets     │        │  - Book Parcel   │        │  - Public Search │
│  - GPS Tracking  │        │  - Pickup Request│        │  - Live Map Move │
│  - Camera Scan   │        │  - COD Balance   │        │  - Push Alerts   │
│  - POD Signature │        │  - Push Notifs   │        │  - Download POD  │
│  - Offline Mode  │        │  - PDF Invoices  │        │  - Rate Delivery │
└──────────────────┘        └──────────────────┘        └──────────────────┘
```

---

## 🛠️ 2. Recommended Flutter Technology Stack & Packages

| Category | Package / Library | Purpose |
|---|---|---|
| **State Management** | `flutter_bloc` / `bloc` (or `flutter_riverpod`) | Predictable, enterprise-grade reactive state with event-driven architecture |
| **Networking & HTTP** | `dio` + `pretty_dio_logger` | High-performance HTTP client with JWT interceptor, auto retry, timeout handling |
| **Offline-First Database**| `hive_flutter` or `isar` | Ultra-fast NoSQL local database for offline action queues & cached runsheets |
| **Camera Barcode Scan** | `mobile_scanner` | Native MLKit-powered 60fps camera barcode & QR scanner with torch toggle |
| **GPS & Background Telemetry** | `geolocator` & `flutter_background_geolocation` | Continuous background rider GPS broadcasting to backend WebSocket/SSE |
| **Maps & Routing** | `google_maps_flutter` or `flutter_map` | Interactive live polyline delivery routing and rider pin animation |
| **Digital Signature (POD)** | `signature` | High-resolution touch canvas for customer proof-of-delivery signatures |
| **Bluetooth Thermal Printer** | `blue_thermal_printer` | 1-click 58mm / 80mm / 4x6" wireless Bluetooth sticker & receipt printing |
| **Push Notifications** | `firebase_messaging` + `flutter_local_notifications` | Real-time parcel status push alerts with background message handling |
| **Secure Token Storage** | `flutter_secure_storage` | iOS Keychain & Android EncryptedSharedPreferences for JWT storage |
| **Audio Feedback** | `audioplayers` | Instant audio beep on scan success / buzzer on scan error |
| **PDF Generation** | `pdf` + `printing` | In-app thermal shipping label & remittance invoice rendering |

---

## 🏗️ 3. Clean Architecture Folder Structure

```
mobile-flutter/
├── android/
├── ios/
├── assets/
│   ├── icons/             # Lucide & brand SVG/PNG icons
│   ├── sounds/            # beep.mp3, error.mp3
│   └── images/            # Logo, empty state graphics
├── lib/
│   ├── main.dart          # App entrypoint, dependency injection & provider root
│   ├── core/
│   │   ├── constants/     # API URLs, Theme Colors (Dark Navy `#0b1329`, Blue `#2563eb`)
│   │   ├── network/       # Dio Client, Auth Interceptor, Retry Policy, Error Transformer
│   │   ├── storage/       # SecureStorage, Hive Local DB, Cache Manager
│   │   ├── theme/         # AppTheme, Typography (Inter font), Color Tokens
│   │   ├── utils/         # SoundPlayer, DeviceInfo, Permissions, GeoCalculator
│   │   └── widgets/       # Button, Input, Card, StatusBadge, Toast, Modal, AppHeader
│   │
│   ├── features/
│   │   ├── auth/          # Login, Register, Role Selector, Splash Screen
│   │   │   ├── data/      # AuthRemoteDataSource, AuthRepositoryImpl, UserModel
│   │   │   ├── domain/    # AuthRepository, LoginUseCase, LogoutUseCase
│   │   │   └── presentation/ # AuthBloc, LoginScreen, RegisterScreen
│   │   │
│   │   ├── rider_runsheet/# Daily Rider Deliveries, OTP Verification, Cash Collect
│   │   │   ├── data/      # RunsheetRepositoryImpl, DeliveryTaskModel, OfflineQueue
│   │   │   ├── domain/    # GetRunsheetUseCase, CompleteDeliveryUseCase
│   │   │   └── presentation/ # RunsheetBloc, TaskDetailScreen, PodSignatureModal
│   │   │
│   │   ├── live_tracking/ # GPS Telemetry broadcaster & Live Map View
│   │   │   ├── data/      # LocationService, SSERepositoryImpl
│   │   │   └── presentation/ # TrackingBloc, LiveDeliveryMapScreen
│   │   │
│   │   ├── scanner/       # High-speed camera barcode & QR scanner
│   │   │   └── presentation/ # CameraScannerScreen, BatchScanResultsModal
│   │   │
│   │   ├── merchant/      # Parcel Booking Wizard, Pickups, Address Book
│   │   │   └── presentation/ # MerchantDashboardScreen, CreateParcelScreen
│   │   │
│   │   ├── finance/       # Balance KPI, Payout Request, PDF Statement
│   │   │   └── presentation/ # WalletScreen, PayoutModal
│   │   │
│   │   └── printer/       # Bluetooth thermal label & receipt printer
│   │       └── presentation/ # BluetoothDevicePickerModal, LabelPreviewScreen
│   │
│   └── routes/            # AppRouter (GoRouter or AutoRoute with Role Guards)
└── pubspec.yaml           # Flutter dependencies & configuration
```

---

## 🔗 4. Complete Backend REST API Mapping Matrix

| App Feature | HTTP Method & Endpoint | Request Body / Params | Flutter Dart Model / Repository |
|---|---|---|---|
| **User Sign In** | `POST /api/v1/auth/login` | `{ email, password }` | `AuthRepository.login()` ➔ `AuthResponseModel` |
| **User Sign Up** | `POST /api/v1/auth/register` | `{ name, email, phone, password, role }` | `AuthRepository.register()` |
| **Fetch Current User** | `GET /api/v1/auth/me` | *Bearer Token* | `AuthRepository.getCurrentUser()` ➔ `UserModel` |
| **Rider Daily Runsheet** | `GET /api/v1/riders/runsheet` | *Bearer Token (Rider)* | `RunsheetRepository.getDailyTasks()` ➔ `List<DeliveryTask>` |
| **Update Delivery Status**| `PATCH /api/v1/shipments/:id/status` | `{ status: 'DELIVERED', podSignatureUrl, otp }` | `ShipmentRepository.updateStatus()` |
| **Broadcast Rider GPS** | `POST /api/v1/tracking/telemetry` | `{ shipmentId, lat, lng, speed, heading }` | `LocationRepository.sendCoordinates()` |
| **Live Customer Stream** | `GET /api/v1/tracking/stream/:trackingNumber` | *Server-Sent Events / WS* | `TrackingRepository.subscribeLiveStream()` |
| **Barcode Parcel Lookup**| `GET /api/v1/shipments/barcode/:barcode` | `:barcode` query | `ScannerRepository.lookupParcel()` |
| **AI Optimize Route** | `POST /api/v1/riders/optimize-route` | `{ stops: [{ lat, lng, id }] }` | `RouteRepository.optimizeStops()` ➔ `OptimizedRoute` |
| **Sync Offline Queue** | `POST /api/v1/shipments/sync-offline` | `List<OfflineDeliveryAction>` | `OfflineSyncService.reconcile()` |
| **Merchant Shipments** | `GET /api/v1/shipments` | `?page=1&status=PENDING` | `ShipmentRepository.getMerchantShipments()` |
| **Create New Parcel** | `POST /api/v1/shipments` | `{ recipientName, address, cod, weight }` | `ShipmentRepository.createShipment()` |
| **Schedule Pickup** | `POST /api/v1/pickups` | `{ addressId, requestedDate, vehicleType }` | `PickupRepository.schedulePickup()` |
| **Wallet & Balance** | `GET /api/v1/finance/summary` | *Bearer Token (Merchant)* | `FinanceRepository.getSummary()` ➔ `FinanceSummary` |
| **Request Payout** | `POST /api/v1/finance/payout-request` | `{ amount, method: 'bank_transfer' }` | `FinanceRepository.requestPayout()` |
| **Upload POD Photo** | `POST /api/v1/upload/pod` | `MultipartFormData (image)` | `StorageService.uploadPodImage()` |

---

## ⚡ 5. Core Native Mobile Capabilities & Flows

### 🛵 Flow A: Rider Delivery & Offline POD Execution
1. Rider logs in and fetches today's assigned tasks (`GET /api/v1/riders/runsheet`).
2. App stores the complete task list into **Hive Local DB** (enabling 100% offline access).
3. Rider taps **"AI Optimize Route"** ➔ App calls `/api/v1/riders/optimize-route` and re-orders stops sequentially.
4. Rider taps **"Navigate"** ➔ Launches native Google Maps / Apple Maps / Waze with the stop waypoint.
5. On arrival:
   - Rider taps **"Complete Delivery"** ➔ Opens POD modal.
   - Customer signs on digital canvas or gives 4-digit SMS OTP.
   - If offline: Action is queued in Hive `OfflineQueueBox`.
   - When 4G/WiFi is restored: `OfflineSyncService` background worker flushes queue to backend database automatically.

---

### 📷 Flow B: High-Speed Camera Barcode Scanning
1. Rider / Hub Operator opens camera scanner tab (`mobile_scanner`).
2. Camera detects parcel Code-128 barcode in ~50ms.
3. App plays crisp audio beep (`audioplayers`) and provides tactile haptic feedback.
4. Instantly displays parcel summary sheet (Customer name, destination, COD amount to collect).

---

### 🗺️ Flow C: Real-Time Live Map Telemetry
1. When rider changes status to `OUT_FOR_DELIVERY`, background GPS worker activates.
2. App streams GPS coordinates to backend Redis Pub/Sub every 5 seconds.
3. On customer tracking screen (`/track/SHN-XXXX`), live Leaflet / Google Map animates the rider bike icon in real time with dynamic ETA countdown.

---

## 📋 6. Flutter Setup & Quick-Start Commands

```bash
# 1. Create Flutter Project in this repository
flutter create --org com.shohnaat --project-name shohnaat_mobile mobile-flutter

# 2. Navigate to project
cd mobile-flutter

# 3. Add Core Dependencies
flutter pub add flutter_bloc dio hive_flutter isar geolocator mobile_scanner google_maps_flutter signature blue_thermal_printer flutter_secure_storage audioplayers pdf printing pretty_dio_logger intl
```
