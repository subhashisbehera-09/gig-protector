# GigProtector Mobile App

A Flutter mobile application for gig workers to manage income protection insurance.

## Features

- **Worker Registration**: Multi-step onboarding with KYC verification
- **Policy Management**: Choose between Basic, Standard, and Premium coverage tiers
- **Premium Calculator**: Dynamic pricing based on ML model
- **Claims Management**: Zero-touch automated claim processing
- **Trigger Monitor**: Real-time parametric weather disruption detection
- **Dashboard**: Overview of coverage, payouts, and activity

## Tech Stack

- **Flutter** - Cross-platform mobile framework
- **Provider** - State management
- **Material Design 3** - UI components

## Setup Instructions

### Prerequisites

1. **Install Flutter SDK** (if not already installed):
   ```bash
   # Windows (using Chocolatey)
   choco install flutter
   
   # macOS (using Homebrew)
   brew install flutter
   
   # Linux (Snap)
   sudo snap install flutter --classic
   ```

2. **Verify Flutter installation**:
   ```bash
   flutter doctor
   ```

### Running the App

1. **Navigate to project directory**:
   ```bash
   cd C:\Users\Victus\OneDrive\Desktop\GigProtector\mobile\gig_protector
   ```

2. **Get dependencies**:
   ```bash
   flutter pub get
   ```

3. **Run the app**:
   ```bash
   # Run on connected device/emulator
   flutter run
   
   # Run on specific device
   flutter run -d <device_id>
   ```

### Building for Production

**Android APK**:
```bash
flutter build apk --release
```

**Android App Bundle**:
```bash
flutter build appbundle --release
```

**iOS** (requires macOS with Xcode):
```bash
flutter build ios --release
```

## Project Structure

```
gig_protector/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── models/
│   │   └── app_state.dart       # Global app state (Provider)
│   ├── screens/
│   │   ├── register_screen.dart # Worker registration flow
│   │   ├── policy_screen.dart   # Policy management
│   │   ├── premium_screen.dart   # Premium calculator
│   │   ├── claims_screen.dart   # Claims management
│   │   ├── triggers_screen.dart # Trigger monitor
│   │   └── dashboard_screen.dart # Main dashboard
│   ├── widgets/
│   │   ├── main_navigation.dart # Bottom navigation bar
│   │   └── common_widgets.dart  # Reusable UI components
│   └── theme/
│       └── app_theme.dart       # Dark theme configuration
└── pubspec.yaml                 # Dependencies
```

## Screenshots

The app features a dark theme with:
- Gradient hero sections
- Badge system for status indicators
- Progress bars for risk/confidence visualization
- Timeline activity feed
- Zone map visualization

## API Integration

The app is designed to integrate with:
- **OpenWeatherMap API** - Weather data
- **IMD API** - India Meteorological Department
- **CPCB Safar API** - Air quality data
- **DigiLocker API** - KYC verification

## Notes

- This is a frontend-only implementation
- Backend API integration required for production
- Currently uses mock data for demonstration
