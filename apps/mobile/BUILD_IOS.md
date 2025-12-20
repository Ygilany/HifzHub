# Building iOS App for Local Deployment

This guide will help you build an iOS app that can be installed on your iPhone without going through the App Store.

## Prerequisites

1. **Apple Developer Account** (Free or Paid)
   - Free account: Can deploy to your own devices (limited to 3 apps, expires after 7 days)
   - Paid account ($99/year): No limits, apps don't expire

2. **Xcode** installed on your Mac (latest version recommended)

3. **Your iPhone** connected via USB or on the same Wi-Fi network

## Method 1: Build and Install Directly (Recommended for Development)

This method builds and installs directly to your connected device:

```bash
# Navigate to the mobile app directory
cd apps/mobile

# Install dependencies (if not already done)
pnpm install

# Install iOS pods
cd ios
pod install
cd ..

# Build and run on your connected device
pnpm ios --device
```

Or using the root command:
```bash
pnpm ios --filter=mobile --device
```

## Method 2: Create an .ipa File (For Distribution)

This method creates an installable .ipa file that you can install via various methods:

### Step 1: Open in Xcode

```bash
cd apps/mobile
open ios/mobile.xcworkspace
```

**Important**: Always open the `.xcworkspace` file, not the `.xcodeproj` file.

### Step 2: Configure Signing

1. In Xcode, select the **mobile** project in the navigator
2. Select the **mobile** target
3. Go to the **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** (your Apple Developer account)
6. Xcode will automatically create a provisioning profile

**Note**: If you see signing errors:
- Make sure you're signed into Xcode with your Apple ID: `Xcode > Settings > Accounts`
- For free accounts, you may need to trust the developer certificate on your device

### Step 3: Select Your Device

1. In the device selector (top toolbar), choose your connected iPhone
2. Make sure it's set to **"Any iOS Device"** or your specific device name

### Step 4: Build Archive

1. Go to **Product > Archive** (or press `Cmd + B` then `Product > Archive`)
2. Wait for the build to complete
3. The Organizer window will open showing your archive

### Step 5: Export for Ad-Hoc Distribution

1. In the Organizer, select your archive
2. Click **"Distribute App"**
3. Select **"Ad Hoc"** (for installing on specific devices)
4. Click **Next**
5. Select your distribution certificate and provisioning profile
6. Click **Next**
7. Choose export options (defaults are usually fine)
8. Click **Export**
9. Choose a location to save the .ipa file

### Step 6: Install on Your Device

You have several options:

**Option A: Using Xcode**
- Connect your device
- In Xcode: `Window > Devices and Simulators`
- Select your device
- Drag and drop the .ipa file into the "Installed Apps" section

**Option B: Using Finder (macOS Catalina+)**
- Connect your device
- Open Finder
- Select your device in the sidebar
- Drag and drop the .ipa file

**Option C: Using Apple Configurator 2**
- Download from the Mac App Store
- Connect device
- Drag .ipa file to the device

**Option D: Using 3uTools or similar tools**
- Third-party tools can also install .ipa files

## Troubleshooting

### "No devices found"
- Make sure your iPhone is unlocked
- Trust the computer on your iPhone when prompted
- Check that your device appears in Xcode: `Window > Devices and Simulators`

### Signing Errors
- Make sure you're signed into Xcode with your Apple ID
- For free accounts, you may need to manually create certificates in Apple Developer portal
- Try cleaning the build folder: `Product > Clean Build Folder` (Shift + Cmd + K)

### Build Errors
- Make sure all pods are installed: `cd ios && pod install`
- Try cleaning: `cd ios && xcodebuild clean`
- Check that you're using the workspace, not the project file

### App Expires After 7 Days (Free Account)
- This is normal for free Apple Developer accounts
- Re-install the app or upgrade to a paid account

## Quick Build Script

You can also use the provided build script:

```bash
./scripts/build-ios.sh
```

This script automates the build process.



