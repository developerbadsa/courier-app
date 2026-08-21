# APK Download Folder

Place the built `shohnaat-rider.apk` file in this directory.

## How to Build & Deploy APK

### Step 1: Build the APK (from mobile-flutter/)

```bash
cd mobile-flutter
flutter build apk --release
```

The APK will be generated at:
```
mobile-flutter/build/app/outputs/flutter-apk/app-release.apk
```

### Step 2: Copy to downloads folder

```bash
cp mobile-flutter/build/app/outputs/flutter-apk/app-release.apk frontend/public/downloads/shohnaat-rider.apk
```

Or use the deploy script:
```bash
./scripts/deploy-apk.sh
```

### Step 3: Rebuild & Deploy Frontend

```bash
cd frontend
npm run build
# Deploy the .next/ output to your VPS
```

## Access URL

Once deployed, riders can download the APK at:
```
https://shohnaat.rahimbadsa.me/downloads/shohnaat-rider.apk
```

## Notes

- The DownloadAppBanner on the `/rider` page will automatically link to this file
- The banner shows a QR code + download button for mobile users
- Android Chrome users get a PWA install prompt (no APK needed)
- iOS users get "Add to Home Screen" instructions
