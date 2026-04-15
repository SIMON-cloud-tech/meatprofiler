# How to Build and Install Meat Freshness Visualizer on Your Phone

## Method 1: GitHub Actions (Recommended - No Android Studio Required)

### Step 1: Trigger the Build
1. Go to your GitHub repository: https://github.com/SIMON-cloud-tech/meatprofiler
2. Click on the "Actions" tab
3. Click on "Build Android APK" workflow
4. Click "Run workflow" button on the right
5. Select "main" branch and click "Run workflow"

### Step 2: Download the APK
1. Wait for the build to complete (usually 2-3 minutes)
2. Click on the completed workflow run
3. Go to "Artifacts" section
4. Download "meatprofiler-apk" zip file
5. Extract the zip file to get `app-debug.apk`

### Step 3: Install on Your Phone
1. Enable "Install from unknown sources" in your phone settings:
   - Android 8+: Settings > Apps & notifications > Special access > Install unknown apps
   - Allow your browser/file manager to install APKs
2. Transfer the APK file to your phone (USB, email, cloud storage)
3. Open the APK file and follow installation prompts

---

## Method 2: GitHub Codespaces (Online Development)

### Step 1: Create Codespace
1. Go to your GitHub repository
2. Click green "<> Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on main"

### Step 2: Build in Browser
1. Wait for codespace to load (2-3 minutes)
2. In terminal, run:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

### Step 3: Download and Install
1. Download the APK from the file explorer
2. Transfer to your phone and install as above

---

## Method 3: Online Build Services

### Option A: AppGyver (No-code)
1. Import your web app at https://www.appgyver.com/
2. Use their "Build Android App" feature
3. Download and install

### Option B: Ionic Appflow
1. Sign up at https://ionicframework.com/appflow
2. Connect your GitHub repository
3. Build and download APK

### Option C: PhoneGap Build
1. Go to https://build.phonegap.com/
2. Upload your www folder
3. Build and download APK

---

## Method 4: Direct Web App (Easiest)

### Step 1: Install as Web App
1. Open https://meatprofiler.app in your phone browser
2. Tap menu (3 dots) and select "Add to Home screen"
3. This creates a web app icon on your home screen

### Step 2: Enable Offline Mode
1. The app works offline once loaded
2. All calculations work without internet

---

## Troubleshooting

### Build Issues
- If GitHub Actions fails, check the error log
- Common issues: Node.js version, Gradle cache, Android SDK

### Installation Issues
- "Install blocked": Enable unknown sources in settings
- "App not installed": Try uninstalling previous version
- "Parse error": APK may be corrupted, rebuild

### Performance Issues
- Web app version: Works on all phones
- Native APK: Better performance but requires installation

---

## Quick Start Summary

**Easiest Method:** Use GitHub Actions
1. Go to Actions tab in GitHub
2. Run "Build Android APK"
3. Download the APK
4. Install on phone

**Alternative:** Use as web app
1. Open https://meatprofiler.app in browser
2. Add to Home screen

The web app version has all the same features and works great on mobile!
