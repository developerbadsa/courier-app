#!/bin/bash
# deploy-apk.sh — Copy built APK to frontend downloads folder for web download
#
# Usage: ./scripts/deploy-apk.sh

set -e

APK_SOURCE_1="mobile-flutter/build/app/outputs/flutter-apk/app-release.apk"
APK_SOURCE_2="mobile-flutter/release-apk/Shohnaat-Logistics-v1.0.0-release.apk"
APK_DEST="frontend/public/downloads/shohnaat-rider.apk"

echo "🔍 Looking for built APK..."

APK_SOURCE=""
if [ -f "$APK_SOURCE_1" ]; then
  APK_SOURCE="$APK_SOURCE_1"
elif [ -f "$APK_SOURCE_2" ]; then
  APK_SOURCE="$APK_SOURCE_2"
else
  echo "❌ APK not found!"
  echo "   Checked: $APK_SOURCE_1"
  echo "   Checked: $APK_SOURCE_2"
  echo ""
  echo "💡 Build it first:"
  echo "   cd mobile-flutter && flutter build apk --release"
  echo ""
  exit 1
fi

echo "📦 Found APK: $(du -h "$APK_SOURCE" | cut -f1)"
echo "📋 Copying to: $APK_DEST"

cp "$APK_SOURCE" "$APK_DEST"

echo "✅ APK deployed successfully!"
echo ""
echo "📍 Download URL: https://shohnaat.rahimbadsa.me/downloads/shohnaat-rider.apk"
echo ""
echo "🔄 Next steps:"
echo "   1. Rebuild frontend: cd frontend && npm run build"
echo "   2. Deploy to VPS"
