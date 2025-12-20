#!/bin/bash

# iOS Build Script for Local Deployment
# This script helps build an iOS app for local installation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_DIR="$MOBILE_DIR/ios"

echo "🚀 iOS Build Script for Local Deployment"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "$IOS_DIR" ]; then
  echo "❌ Error: iOS directory not found at $IOS_DIR"
  exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
  echo "❌ Error: Xcode is not installed or xcodebuild is not in PATH"
  echo "   Please install Xcode from the Mac App Store"
  exit 1
fi

echo "✅ Xcode found"
echo ""

# Navigate to mobile directory
cd "$MOBILE_DIR"

# Check if pods are installed
if [ ! -f "$IOS_DIR/Podfile.lock" ]; then
  echo "📦 Installing CocoaPods dependencies..."
  cd "$IOS_DIR"
  pod install
  cd "$MOBILE_DIR"
else
  echo "✅ CocoaPods dependencies already installed"
fi

echo ""
echo "📱 Build Options:"
echo "1. Build and run on connected device (development)"
echo "2. Open Xcode workspace (manual build)"
echo ""
read -p "Select option (1 or 2): " option

case $option in
  1)
    echo ""
    echo "🔨 Building and installing on connected device..."
    echo "   Make sure your iPhone is connected and unlocked"
    echo ""
    
    # Check if device is connected
    if ! xcrun xctrace list devices 2>/dev/null | grep -q "iPhone"; then
      echo "⚠️  Warning: No iPhone detected. Make sure your device is:"
      echo "   - Connected via USB or on the same Wi-Fi"
      echo "   - Unlocked"
      echo "   - Trusted this computer"
      echo ""
      read -p "Continue anyway? (y/n): " continue_anyway
      if [ "$continue_anyway" != "y" ]; then
        exit 0
      fi
    fi
    
    # Build and run
    pnpm ios --device
    ;;
  2)
    echo ""
    echo "📂 Opening Xcode workspace..."
    echo "   Follow the instructions in BUILD_IOS.md to build manually"
    open "$IOS_DIR/mobile.xcworkspace"
    ;;
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "For detailed instructions, see: BUILD_IOS.md"



